import type { LoteConClientes } from "~/db/lotes";
import type { VentaLote } from "~/db/ventas";

type Lote = LoteConClientes;

/** 10%, in hundredths of a percent: what every sale starts from, on both sides. */
export const COMISION_DEFECTO = 1000;

const ventaDe = (l: Lote): VentaLote => ({
  numero: l.numero,
  compradorId: l.compradorId,
  precioVenta: l.precioVenta,
  vendidoCon: l.vendidoCon,
  comisionCompra: l.comisionCompra,
  comisionVenta: l.comisionVenta,
});

const libre = (l: Lote): VentaLote => ({
  ...ventaDe(l),
  compradorId: null,
  precioVenta: null,
  vendidoCon: null,
});

export const ventasDe = (lotes: Lote[], numeros: number[]) =>
  lotes.filter((l) => numeros.includes(l.numero)).map(ventaDe);

export const ventasAdjudicar = (
  lotes: Lote[],
  numero: number,
  venta: {
    precio: number;
    compradorId: number;
    comisionCompra: number;
    comisionVenta: number;
  },
  grupo: number[],
) => {
  const filas: VentaLote[] = [];
  for (const l of lotes) {
    if (l.numero === numero)
      filas.push({
        ...ventaDe(l),
        compradorId: venta.compradorId,
        precioVenta: venta.precio,
        vendidoCon: null,
        comisionCompra: venta.comisionCompra,
        comisionVenta: venta.comisionVenta,
      });
    else if (grupo.includes(l.numero))
      filas.push({
        ...ventaDe(l),
        compradorId: venta.compradorId,
        precioVenta: null,
        vendidoCon: numero,
      });
    else if (l.vendidoCon === numero) filas.push(libre(l));
  }
  return filas;
};

/** The lot and those sold with it go back to unsold. */
export const ventasQuitar = (lotes: Lote[], numero: number) =>
  lotes
    .filter((l) => l.numero === numero || l.vendidoCon === numero)
    .map(libre);

export const ventaSeparar = (lote: Lote) => [libre(lote)];
