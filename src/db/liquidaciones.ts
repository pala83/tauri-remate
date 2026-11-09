import { desc, eq, sql } from "drizzle-orm";
import type { DatosRemate } from "~/lib/liquidacion";
import { consultaRecordada } from "~/store";
import { getDb } from "./client";
import { listarLotes } from "./lotes";
import { olvidarLiquidaciones } from "./olvidos";
import { cuotas, liquidaciones, pagoLotes, pagos, remates } from "./schema";

/** From the database: the truth, for forms and anything that's saved. */
export async function leerDatosRemate(remateId: number): Promise<DatosRemate> {
  const db = await getDb();
  const deLiquidaciones = sql`(select id from liquidaciones where remate_id = ${remateId})`;
  const [filas, liqs, cuotasDe, pagosDe, aplicados] = await Promise.all([
    listarLotes(remateId),
    db.select().from(liquidaciones).where(eq(liquidaciones.remateId, remateId)),
    db
      .select()
      .from(cuotas)
      .where(sql`${cuotas.liquidacionId} in ${deLiquidaciones}`)
      .orderBy(cuotas.vence, cuotas.id),
    db
      .select()
      .from(pagos)
      .where(sql`${pagos.liquidacionId} in ${deLiquidaciones}`)
      .orderBy(desc(pagos.fecha), desc(pagos.id)),
    db.select().from(pagoLotes).where(eq(pagoLotes.remateId, remateId)),
  ]);
  return {
    lotes: filas,
    liquidaciones: liqs,
    cuotas: cuotasDe,
    pagos: pagosDe,
    pagoLotes: aplicados,
  };
}

/** Only to show: what was read last, until something changes it. */
export const verDatosRemate = (remateId: number) =>
  consultaRecordada(`remate-${remateId}-datos`, () =>
    leerDatosRemate(remateId),
  );

/** The remates where a client bought, sold or has a settlement. */
export async function rematesDeCliente(clienteId: number) {
  const db = await getDb();
  return db
    .select()
    .from(remates)
    .where(
      sql`${remates.id} in (
        select remate_id from lotes where dueno_id = ${clienteId} or comprador_id = ${clienteId}
        union
        select remate_id from liquidaciones where cliente_id = ${clienteId}
      )`,
    )
    .orderBy(desc(remates.fecha));
}

export type RemateDeCliente = Awaited<
  ReturnType<typeof rematesDeCliente>
>[number];

/** Only to show. */
export const verRematesDeCliente = (clienteId: number) =>
  consultaRecordada(`remates-de-${clienteId}`, () =>
    rematesDeCliente(clienteId),
  );

/** One settlement, from the database: for its form and its toggle. */
export async function leerLiquidacion(id: number) {
  const db = await getDb();
  const [liq] = await db
    .select()
    .from(liquidaciones)
    .where(eq(liquidaciones.id, id));
  if (!liq) throw new Error("No se encontró la liquidación.");
  return liq;
}

export async function generarLiquidacion(
  remateId: number,
  clienteId: number,
  sinComision: boolean,
) {
  const db = await getDb();
  await db
    .insert(liquidaciones)
    .values({ remateId, clienteId, sinComision })
    .onConflictDoNothing()
    .finally(olvidarLiquidaciones);
}

export async function editarLiquidacion(
  id: number,
  campos: { sinComision?: boolean; notas?: string | null },
) {
  const db = await getDb();
  await db
    .update(liquidaciones)
    .set(campos)
    .where(eq(liquidaciones.id, id))
    .finally(olvidarLiquidaciones);
}
