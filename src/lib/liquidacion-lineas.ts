import type { LoteConClientes } from "~/db/lotes";
import { hijosDe } from "./martillo";

export type LineaLiquidacion = {
  numero: number;
  articulo: string;
  precio: number;
  comision: number;
  total: number;
  /** What's left to pay of a purchase. */
  resta: number;
  pagado: number;
  otro: string | null;
  propio: boolean;
};

/** What the buyer pays, rounded to the peso per lot. Commissions are in hundredths. */
export const totalCompra = (precio: number, comision: number) =>
  Math.round((precio * (10000 + comision)) / 10000);

/** What the owner receives, rounded to the peso per lot. */
export const totalVenta = (precio: number, comision: number) =>
  Math.round((precio * (10000 - comision)) / 10000);

const conHijos = (lote: LoteConClientes, lotes: LoteConClientes[]) => {
  const hijos = hijosDe(lotes, lote.numero);
  return hijos.length
    ? `${lote.nombre} + N° ${hijos.map((h) => h.numero).join(", ")}`
    : lote.nombre;
};

/** Only called for lots with a price. */
export const lineaCompra = (
  l: LoteConClientes,
  lotes: LoteConClientes[],
  comision: number,
  pagado: number,
  clienteId: number,
): LineaLiquidacion => {
  const precio = l.precioVenta!;
  const total = totalCompra(precio, comision);
  return {
    numero: l.numero,
    articulo: conHijos(l, lotes),
    precio,
    comision,
    total,
    pagado,
    resta: Math.max(0, total - pagado),
    otro: l.duenoNombre,
    propio: l.duenoId === clienteId,
  };
};

export const lineaVenta = (
  l: LoteConClientes,
  lotes: LoteConClientes[],
  comision: number,
  clienteId: number,
): LineaLiquidacion => {
  const precio = l.precioVenta!;
  return {
    numero: l.numero,
    articulo: conHijos(l, lotes),
    precio,
    comision,
    total: totalVenta(precio, comision),
    pagado: 0,
    resta: 0,
    otro: l.compradorNombre,
    propio: l.compradorId === clienteId,
  };
};
