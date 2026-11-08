import { and, eq, getTableColumns, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { getDb } from "./client";
import { clientes, lotes, type NewLote } from "./schema";
import { soltarPagos } from "./ventas";

const dueno = alias(clientes, "dueno");
const comprador = alias(clientes, "comprador");

export type ValoresLote = Omit<NewLote, "remateId" | "numero">;

const lotesConClientes = (db: Awaited<ReturnType<typeof getDb>>) =>
  db
    .select({
      ...getTableColumns(lotes),
      // `nombre` exists in the three tables and rows are keyed by column name.
      duenoNombre: sql<string>`${dueno.nombre}`.as("dueno_nombre"),
      compradorNombre: sql<string | null>`${comprador.nombre}`.as(
        "comprador_nombre",
      ),
    })
    .from(lotes)
    .innerJoin(dueno, eq(lotes.duenoId, dueno.id))
    .leftJoin(comprador, eq(lotes.compradorId, comprador.id));

export async function listarLotes(remateId: number) {
  const db = await getDb();
  return lotesConClientes(db)
    .where(eq(lotes.remateId, remateId))
    .orderBy(lotes.numero);
}

export type LoteConClientes = Awaited<ReturnType<typeof listarLotes>>[number];

export async function leerLote(remateId: number, numero: number) {
  const db = await getDb();
  const [lote] = await lotesConClientes(db).where(
    and(eq(lotes.remateId, remateId), eq(lotes.numero, numero)),
  );
  return lote as LoteConClientes;
}

/** Takes the next number in a single statement, so it can't be repeated. */
export async function crearLote(remateId: number, valores: ValoresLote) {
  const db = await getDb();
  const [creado] = await db
    .insert(lotes)
    .values({
      ...valores,
      remateId,
      numero: sql`(select coalesce(max(numero), 0) + 1 from lotes where remate_id = ${remateId})`,
    })
    .returning({ numero: lotes.numero });
  return creado.numero;
}

export async function editarLote(
  remateId: number,
  numero: number,
  valores: ValoresLote,
) {
  const db = await getDb();
  const donde = and(eq(lotes.remateId, remateId), eq(lotes.numero, numero));
  const [antes] = await db
    .select({ compradorId: lotes.compradorId })
    .from(lotes)
    .where(donde);
  await db.update(lotes).set(valores).where(donde);
  const comprador = valores.compradorId ?? null;
  if (antes.compradorId === comprador) return;
  // What the old buyer paid for this lot stays on their account.
  await soltarPagos(remateId, [numero]);
  if (comprador === null) return;
  await db
    .update(lotes)
    .set({ compradorId: comprador })
    .where(and(eq(lotes.remateId, remateId), eq(lotes.vendidoCon, numero)));
}

export async function borrarLote(remateId: number, numero: number) {
  const db = await getDb();
  await db
    .delete(lotes)
    .where(and(eq(lotes.remateId, remateId), eq(lotes.numero, numero)));
}
