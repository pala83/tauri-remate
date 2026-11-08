import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "./client";
import { pagoLotes, type PagoLote } from "./schema";

export type VentaLote = {
  numero: number;
  compradorId: number | null;
  precioVenta: number | null;
  vendidoCon: number | null;
  comisionCompra: number;
  comisionVenta: number;
};

/** A single UPDATE, so a lot and those sold with it change together. */
export async function escribirVentas(remateId: number, ventas: VentaLote[]) {
  const db = await getDb();
  await db.run(sql`
    update lotes set
      comprador_id = j.comprador,
      precio_venta = j.precio,
      vendido_con = j.con,
      comision_compra = j.compra,
      comision_venta = j.venta
    from (
      select
        json_extract(value, '$.numero') as numero,
        json_extract(value, '$.compradorId') as comprador,
        json_extract(value, '$.precioVenta') as precio,
        json_extract(value, '$.vendidoCon') as con,
        json_extract(value, '$.comisionCompra') as compra,
        json_extract(value, '$.comisionVenta') as venta
      from json_each(${JSON.stringify(ventas)})
    ) as j
    where lotes.remate_id = ${remateId} and lotes.numero = j.numero`);
}

/** Lots no longer bought by that client release what was paid for them. */
export async function soltarPagos(remateId: number, numeros: number[]) {
  const db = await getDb();
  return db
    .delete(pagoLotes)
    .where(
      and(
        eq(pagoLotes.remateId, remateId),
        inArray(pagoLotes.loteNumero, numeros),
      ),
    )
    .returning();
}

export async function devolverPagos(filas: PagoLote[]) {
  if (filas.length === 0) return;
  const db = await getDb();
  await db.insert(pagoLotes).values(filas);
}
