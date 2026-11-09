import { and, desc, eq, getTableColumns, ne, sql } from "drizzle-orm";
import { textoCliente, titulo } from "~/lib/textos";
import { consultaRecordada } from "~/store";
import { getDb, type Db } from "./client";
import { textoDeBase } from "./errores";
import { olvidarClientes, olvidarTodo } from "./olvidos";
import { clientes, lotes, remates, type NewCliente } from "./schema";

const conCuentas = (db: Db) =>
  db
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
    .from(clientes);

/** From the database: the truth, for forms and anything that's saved. */
export async function listarClientes() {
  return conCuentas(await getDb()).orderBy(clientes.nombre);
}

export type ClienteResumen = Awaited<ReturnType<typeof listarClientes>>[number];

/** Only to show: what was read last, until something changes it. */
export const verClientes = () => consultaRecordada("clientes", listarClientes);

/** One client, from the database. */
export async function leerCliente(id: number): Promise<ClienteResumen> {
  const [cliente] = await conCuentas(await getDb()).where(eq(clientes.id, id));
  if (!cliente) throw new Error("No se encontró el cliente.");
  return cliente;
}

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

/** The client with that name, other than `salvo`, from the database. */
export async function clienteLlamado(nombre: string, salvo?: number) {
  const igual = eq(clientes.nombre, textoCliente(nombre));
  const [hallado] = await conCuentas(await getDb()).where(
    salvo === undefined ? igual : and(igual, ne(clientes.id, salvo)),
  );
  return hallado as ClienteResumen | undefined;
}

/** The name is unique: a repeated one gets a message the user can read. */
const sinRepetir =
  (nombre: string) =>
  (err: unknown): never => {
    if (/UNIQUE constraint failed: clientes\.nombre/.test(textoDeBase(err)))
      throw new Error(`Ya existe un cliente llamado ${titulo(nombre)}.`);
    throw err;
  };

export async function crearCliente(valores: NewCliente) {
  const db = await getDb();
  const guardar = paraGuardar(valores);
  const [creado] = await db
    .insert(clientes)
    .values(guardar)
    .returning({ id: clientes.id })
    .catch(sinRepetir(guardar.nombre))
    .finally(olvidarClientes);
  return creado.id;
}

/** Renaming to another client's name fails: that is `unificarClientes`. */
export async function editarCliente(id: number, valores: NewCliente) {
  const db = await getDb();
  const guardar = paraGuardar(valores);
  await db
    .update(clientes)
    .set(guardar)
    .where(eq(clientes.id, id))
    .catch(sinRepetir(guardar.nombre))
    .finally(olvidarTodo);
}

/**
 * Every row pointing at `seVa` moves to `queda`, and `seVa` is deleted.
 * In Rust: several tables, all at once or not at all.
 */
export async function unificarClientes(queda: number, seVa: number) {
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("unificar_clientes", { queda, seVa }).finally(olvidarTodo);
}

export async function marcarSinComision(id: number, sinComision: boolean) {
  const db = await getDb();
  await db
    .update(clientes)
    .set({ sinComision })
    .where(eq(clientes.id, id))
    .finally(olvidarClientes);
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

/** Only to show. */
export const verHistorial = (clienteId: number) =>
  consultaRecordada(`historial-${clienteId}`, () =>
    historialCliente(clienteId),
  );
