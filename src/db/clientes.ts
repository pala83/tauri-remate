import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { textoCliente } from "~/lib/textos";
import { getDb } from "./client";
import { clientes, lotes, remates, type NewCliente } from "./schema";

export async function listarClientes() {
  const db = await getDb();
  return db
    .select({
      ...getTableColumns(clientes),
      aporta:
        sql<number>`(select count(*) from lotes where lotes.dueno_id = clientes.id)`.as(
          "total_aporta",
        ),
      compro:
        sql<number>`(select count(*) from lotes where lotes.comprador_id = clientes.id)`.as(
          "total_compro",
        ),
    })
    .from(clientes)
    .orderBy(clientes.nombre);
}

export type ClienteResumen = Awaited<ReturnType<typeof listarClientes>>[number];

const opcional = (texto?: string | null) =>
  (texto && textoCliente(texto)) || null;

/** Every write goes through here, so clients are always stored the same way. */
const paraGuardar = (valores: NewCliente): NewCliente => ({
  ...valores,
  nombre: textoCliente(valores.nombre),
  telefono: opcional(valores.telefono),
  email: opcional(valores.email),
  referido: opcional(valores.referido),
});

export async function crearCliente(valores: NewCliente) {
  const db = await getDb();
  const [creado] = await db
    .insert(clientes)
    .values(paraGuardar(valores))
    .returning({ id: clientes.id });
  return creado.id;
}

export async function editarCliente(id: number, valores: NewCliente) {
  const db = await getDb();
  await db
    .update(clientes)
    .set(paraGuardar(valores))
    .where(eq(clientes.id, id));
}

const loteConRemate = {
  ...getTableColumns(lotes),
  // Both tables have a `nombre` column and the plugin keys rows by column name,
  // so this one needs an alias in the SQL itself.
  remateNombre: sql<string>`${remates.nombre}`.as("remate_nombre"),
  remateFecha: remates.fecha,
  remateLugar: remates.lugar,
};

/** Lotes a client has contributed and bought, most recent remate first. */
export async function historialCliente(clienteId: number) {
  const db = await getDb();
  const lotesPor = (columna: typeof lotes.duenoId | typeof lotes.compradorId) =>
    db
      .select(loteConRemate)
      .from(lotes)
      .innerJoin(remates, eq(lotes.remateId, remates.id))
      .where(eq(columna, clienteId))
      .orderBy(desc(remates.fecha), lotes.numero);

  const [aportados, comprados] = await Promise.all([
    lotesPor(lotes.duenoId),
    lotesPor(lotes.compradorId),
  ]);
  return { aportados, comprados };
}

export type Historial = Awaited<ReturnType<typeof historialCliente>>;
