import type { LoteConClientes } from "~/db/lotes";

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

const conHijos = (lote: LoteConClientes, lotes: LoteConClientes[]) => {
  const hijos = lotes.filter((l) => l.vendidoCon === lote.numero);
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
  const total = Math.round((precio * (10000 + comision)) / 10000);
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
    total: Math.round((precio * (10000 - comision)) / 10000),
    pagado: 0,
    resta: 0,
    otro: l.compradorNombre,
    propio: l.compradorId === clienteId,
  };
};
