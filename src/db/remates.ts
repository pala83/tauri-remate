import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { getDb } from "./client";
import { lotes, remates, type NewRemate } from "./schema";

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
    .returning({ id: remates.id });
  return creado.id;
}

export async function editarRemate(id: number, valores: Partial<NewRemate>) {
  const db = await getDb();
  await db.update(remates).set(valores).where(eq(remates.id, id));
}
