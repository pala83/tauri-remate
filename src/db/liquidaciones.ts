import { desc, eq, sql } from "drizzle-orm";
import type { DatosRemate } from "~/lib/liquidacion";
import { getDb } from "./client";
import { listarLotes } from "./lotes";
import { cuotas, liquidaciones, pagoLotes, pagos, remates } from "./schema";

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

export async function generarLiquidacion(
  remateId: number,
  clienteId: number,
  sinComision: boolean,
) {
  const db = await getDb();
  await db
    .insert(liquidaciones)
    .values({ remateId, clienteId, sinComision })
    .onConflictDoNothing();
}

export async function editarLiquidacion(
  id: number,
  campos: { sinComision?: boolean; notas?: string | null },
) {
  const db = await getDb();
  await db.update(liquidaciones).set(campos).where(eq(liquidaciones.id, id));
}
