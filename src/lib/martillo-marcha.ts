import type { LoteConClientes } from "~/db/lotes";
import { sinComisionDe, type DatosRemate } from "./liquidacion";
import { totalCompra, totalVenta } from "./liquidacion-lineas";
import { vendido } from "./martillo";
import { COMISION_INVALIDA } from "./martillo-ventas";
import { pesos, porcentaje, titulo } from "./textos";

type Lote = LoteConClientes;

/** Whether a client pays no commission in this remate. */
const sinComisionEn = (
  datos: DatosRemate,
  clientes: { id: number; sinComision: boolean }[],
) => {
  const fijos = new Set(
    clientes.filter((c) => c.sinComision).map((c) => c.id),
  );
  return (id: number | null) =>
    id !== null && sinComisionDe(datos, id, fijos.has(id));
};

export const calculoVenta = (
  datos: DatosRemate,
  clientes: { id: number; nombre: string; sinComision: boolean }[],
  lote: Lote,
  precio: number,
  compradorId: number | null,
  comisionCompra: number | null,
  comisionVenta: number | null,
) => {
  if (comisionCompra === null || comisionVenta === null)
    return COMISION_INVALIDA;
  if (!precio) return "Escribí el precio y elegí el comprador.";
  const sinComision = sinComisionEn(datos, clientes);
  const compra = sinComision(compradorId) ? 0 : comisionCompra;
  const venta = sinComision(lote.duenoId) ? 0 : comisionVenta;
  const comprador = clientes.find((c) => c.id === compradorId);
  const paga = totalCompra(precio, compra);
  const recibe = totalVenta(precio, venta);
  return (
    `${comprador ? titulo(comprador.nombre) : "El comprador"} paga ${pesos(paga)}` +
    (compra ? ` (+${porcentaje(compra)})` : " (sin comisión)") +
    ` · ${titulo(lote.duenoNombre)} recibe ${pesos(recibe)}` +
    (venta ? ` (−${porcentaje(venta)})` : " (sin comisión)")
  );
};

export const marchaDe = (
  datos: DatosRemate,
  clientes: { id: number; sinComision: boolean }[],
) => {
  const sinComision = sinComisionEn(datos, clientes);
  let martillado = 0;
  let comision = 0;
  for (const l of datos.lotes) {
    if (l.precioVenta === null) continue;
    martillado += l.precioVenta;
    // The same rounding as the settlements, so both add up to the same.
    const p = l.precioVenta;
    if (!sinComision(l.compradorId))
      comision += totalCompra(p, l.comisionCompra) - p;
    if (!sinComision(l.duenoId)) comision += p - totalVenta(p, l.comisionVenta);
  }
  const vendidos = datos.lotes.filter(vendido).length;
  return {
    vendidos,
    sinVender: datos.lotes.length - vendidos,
    martillado,
    comision,
  };
};
