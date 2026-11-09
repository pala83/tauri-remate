import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { getDb } from "./client";
import { textoDeBase } from "./errores";
import { errorTxt, lotesTxt, plural } from "~/lib/textos";
import { olvidarRemate, olvidarRemates } from "./olvidos";
import { liquidaciones, lotes, remates, type NewRemate } from "./schema";

export async function listarRemates() {
  const db = await getDb();
  return db
    .select({
      ...getTableColumns(remates),
      lotes: sql<number>`count(${lotes.numero})`.as("total_lotes"),
      duenos: sql<number>`count(distinct ${lotes.duenoId})`.as("total_duenos"),
      proximo: sql<number>`coalesce(max(${lotes.numero}), 0) + 1`.as("proximo"),
    })
    .from(remates)
    .leftJoin(lotes, eq(lotes.remateId, remates.id))
    .groupBy(remates.id)
    .orderBy(desc(remates.fecha), desc(remates.id));
}

export type RemateResumen = Awaited<ReturnType<typeof listarRemates>>[number];

export async function crearRemate(valores: NewRemate) {
  const db = await getDb();
  const [creado] = await db
    .insert(remates)
    .values(valores)
    .returning({ id: remates.id })
    .finally(olvidarRemates);
  return creado.id;
}

/** One remate, from the database: for its edit form. */
export async function leerRemate(id: number) {
  const db = await getDb();
  const [remate] = await db.select().from(remates).where(eq(remates.id, id));
  if (!remate) throw new Error("No se encontró el remate.");
  return remate;
}

export async function editarRemate(id: number, valores: Partial<NewRemate>) {
  const db = await getDb();
  await db
    .update(remates)
    .set(valores)
    .where(eq(remates.id, id))
    .finally(olvidarRemates);
}

/** What keeps a remate from being deleted, from the database. */
export async function contarDelRemate(id: number) {
  const db = await getDb();
  const [cuenta] = await db
    .select({
      lotes: sql<number>`(select count(*) from ${lotes} where ${lotes.remateId} = ${id})`,
      liquidaciones: sql<number>`(select count(*) from ${liquidaciones} where ${liquidaciones.remateId} = ${id})`,
    })
    .from(remates)
    .where(eq(remates.id, id));
  if (!cuenta) throw new Error("No se encontró el remate.");
  return cuenta;
}

/** Why the remate can't be deleted, or nothing if it can. */
export const motivoParaNoBorrar = (c: {
  lotes: number;
  liquidaciones: number;
}) =>
  c.lotes > 0
    ? `No se puede eliminar: tiene ${lotesTxt(c.lotes)}.`
    : c.liquidaciones > 0
      ? `No se puede eliminar: tiene la liquidación de ${plural(c.liquidaciones, "cliente")}.`
      : undefined;

/**
 * Only a remate with no lots and no clients: every key pointing at it is
 * `restrict`, so the database refuses anything else too.
 */
export async function borrarRemate(id: number) {
  const motivo = motivoParaNoBorrar(await contarDelRemate(id));
  if (motivo) throw new Error(motivo);
  const db = await getDb();
  await db
    .delete(remates)
    .where(eq(remates.id, id))
    .catch(async (err: unknown) => {
      // Something was added to it since it was counted.
      if (!/FOREIGN KEY/.test(textoDeBase(err))) throw err;
      throw new Error(
        motivoParaNoBorrar(await contarDelRemate(id)) ?? errorTxt(err),
      );
    })
    .finally(() => olvidarRemate(id));
}
