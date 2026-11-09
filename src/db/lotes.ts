import { and, desc, eq, getTableColumns, inArray, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { consultaRecordada } from "~/store";
import { getDb } from "./client";
import { textoDeBase } from "./errores";
import { olvidarLotes } from "./olvidos";
import { clientes, lotes, type NewLote } from "./schema";
import { escribirVentas } from "./ventas";

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

/** From the database: the truth, for forms and anything that's saved. */
export async function listarLotes(remateId: number) {
  const db = await getDb();
  return lotesConClientes(db)
    .where(eq(lotes.remateId, remateId))
    .orderBy(lotes.numero);
}

export type LoteConClientes = Awaited<ReturnType<typeof listarLotes>>[number];

/** Only to show: what was read last, until something changes it. */
export const verLotes = (remateId: number) =>
  consultaRecordada(`remate-${remateId}-lotes`, () => listarLotes(remateId));

/** From the database: these lots and the ones sold with them, for a sale. */
export async function lotesDeVenta(remateId: number, numeros: number[]) {
  const db = await getDb();
  return lotesConClientes(db)
    .where(
      and(
        eq(lotes.remateId, remateId),
        or(inArray(lotes.numero, numeros), inArray(lotes.vendidoCon, numeros)),
      ),
    )
    .orderBy(lotes.numero);
}

/** From the database: the remate's last lot, if it has any. */
export async function ultimoLote(remateId: number) {
  const db = await getDb();
  const [ultimo] = await lotesConClientes(db)
    .where(eq(lotes.remateId, remateId))
    .orderBy(desc(lotes.numero))
    .limit(1);
  return ultimo;
}

export async function leerLote(remateId: number, numero: number) {
  const db = await getDb();
  const [lote] = await lotesConClientes(db).where(
    and(eq(lotes.remateId, remateId), eq(lotes.numero, numero)),
  );
  if (!lote) throw new Error(`No se encontró el lote N° ${numero}.`);
  return lote;
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
    .returning({ numero: lotes.numero })
    .finally(() => olvidarLotes(remateId));
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
    .select({
      compradorId: lotes.compradorId,
      comisionCompra: lotes.comisionCompra,
      comisionVenta: lotes.comisionVenta,
    })
    .from(lotes)
    .where(donde);
  if (!antes) throw new Error(`No se encontró el lote N° ${numero}.`);
  const { compradorId = null, precioVenta = null, vendidoCon = null } = valores;
  if (antes.compradorId !== compradorId) {
    // The buyer, the payments it releases and the lots sold with it change together.
    await escribirVentas(
      remateId,
      [
        {
          numero,
          compradorId,
          precioVenta,
          vendidoCon,
          comisionCompra: antes.comisionCompra,
          comisionVenta: antes.comisionVenta,
        },
      ],
      { soltar: [numero] },
    );
  }
  await db
    .update(lotes)
    .set(valores)
    .where(donde)
    .finally(() => olvidarLotes(remateId));
}

/** Only an unsold lot: the database refuses one with its sale registered. */
export async function borrarLote(remateId: number, numero: number) {
  const db = await getDb();
  await db
    .delete(lotes)
    .where(and(eq(lotes.remateId, remateId), eq(lotes.numero, numero)))
    .catch((err: unknown) => {
      const texto = textoDeBase(err);
      const no = `No se puede eliminar el N° ${numero}`;
      if (texto.includes("lote vendido"))
        throw new Error(`${no}: tiene la compra registrada.`);
      if (/FOREIGN KEY/.test(texto))
        throw new Error(`${no}: tiene cuotas o pagos registrados.`);
      throw err;
    })
    .finally(() => olvidarLotes(remateId));
}
