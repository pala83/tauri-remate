import type { LoteConClientes } from "~/db/lotes";
import { hijosDe } from "./martillo";
import { COMISION_DEFECTO, ventasAdjudicar } from "./martillo-ventas";
import { campoComision } from "./textos";
import type { VentaLote } from "~/db/ventas";

/** The hammer's fields for a lot, as text the way they're typed. */
export type CamposVenta = {
  precio: string;
  compradorId: number | null;
  comisionCompra: string;
  comisionVenta: string;
  grupo: number[];
};

/**
 * What the hammer shows for N° `numero`, from `lotes` read from the database:
 * the lot and those sold with it. Only a sold lot keeps its own commissions;
 * any new sale starts from the default.
 */
export const camposDe = (
  lotes: LoteConClientes[],
  numero: number | null,
): CamposVenta => {
  const l = lotes.find((x) => x.numero === numero);
  const conVenta = l && l.compradorId !== null;
  return {
    precio: l?.precioVenta ? String(l.precioVenta) : "",
    compradorId: l?.compradorId ?? null,
    comisionCompra: campoComision(
      conVenta ? l.comisionCompra : COMISION_DEFECTO,
    ),
    comisionVenta: campoComision(conVenta ? l.comisionVenta : COMISION_DEFECTO),
    grupo: hijosDe(lotes, numero).map((x) => x.numero),
  };
};

type Venta = {
  precio: number;
  compradorId: number;
  comisionCompra: number;
  comisionVenta: number;
};

/**
 * The rows of a sale of N° `numero` with `grupo`, worked out from `lotes` read
 * from the database just before saving. A text is why it can't be saved.
 */
export const ventaAdjudicada = (
  lotes: LoteConClientes[],
  numero: number,
  venta: Venta,
  grupo: number[],
): { ventas: VentaLote[]; soltar: number[] } | string => {
  const l = lotes.find((x) => x.numero === numero);
  if (!l) return `No se encontró el lote N° ${numero}.`;
  if (l.vendidoCon !== null)
    return `El N° ${numero} se vendió junto con el N° ${l.vendidoCon}.`;
  const ajeno = grupo.find((g) => {
    const x = lotes.find((y) => y.numero === g);
    return !x || x.precioVenta !== null || ![null, numero].includes(x.vendidoCon);
  });
  if (ajeno !== undefined)
    return `El N° ${ajeno} ya no se puede vender junto con el N° ${numero}.`;
  const cambia = l.compradorId !== null && l.compradorId !== venta.compradorId;
  return {
    ventas: ventasAdjudicar(lotes, numero, venta, grupo),
    soltar: cambia ? [numero] : [],
  };
};
