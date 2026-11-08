import type { LoteConClientes } from "~/db/lotes";
import type { DatosRemate } from "./liquidacion";
import { vendido } from "./martillo";
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
  return (id: number | null) => {
    if (id === null) return false;
    const liq = datos.liquidaciones.find((q) => q.clienteId === id);
    return liq ? liq.sinComision : fijos.has(id);
  };
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
    return "La comisión tiene que ser un número de 0 a 100.";
  if (!precio) return "Escribí el precio y elegí el comprador.";
  const sinComision = sinComisionEn(datos, clientes);
  const compra = sinComision(compradorId) ? 0 : comisionCompra;
  const venta = sinComision(lote.duenoId) ? 0 : comisionVenta;
  const comprador = clientes.find((c) => c.id === compradorId);
  const paga = Math.round((precio * (10000 + compra)) / 10000);
  const recibe = Math.round((precio * (10000 - venta)) / 10000);
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
    if (!sinComision(l.compradorId))
      comision += Math.round((l.precioVenta * l.comisionCompra) / 10000);
    if (!sinComision(l.duenoId))
      comision += Math.round((l.precioVenta * l.comisionVenta) / 10000);
  }
  const vendidos = datos.lotes.filter(vendido).length;
  return {
    vendidos,
    sinVender: datos.lotes.length - vendidos,
    martillado,
    comision,
  };
};
