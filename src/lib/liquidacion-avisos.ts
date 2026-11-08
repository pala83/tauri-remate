import type { DatosRemate, Liquidado } from "./liquidacion";
import { titulo } from "./textos";

/** Lots whose price is on another owner's lot: they add nothing here. */
export const avisosDe = (datos: DatosRemate, liq: Liquidado, id: number) => {
  const avisos: string[] = [];
  for (const l of datos.lotes) {
    if (l.duenoId !== id || l.vendidoCon === null) continue;
    const cabeza = datos.lotes.find((x) => x.numero === l.vendidoCon);
    if (cabeza && cabeza.duenoId !== id)
      avisos.push(
        `El N° ${l.numero} se vendió junto con el N° ${cabeza.numero}, de ${titulo(cabeza.duenoNombre)}: el precio quedó en ese lote y acá no suma.`,
      );
  }
  const propios = liq.compras.filter((c) => c.propio).length;
  if (propios)
    avisos.push(
      `${propios === 1 ? "Compró un lote propio" : `Compró ${propios} lotes propios`}: se le cobra comisión de compra y de venta.`,
    );
  if (liq.liq) {
    const suyas = datos.cuotas.filter((q) => q.liquidacionId === liq.liq!.id);
    const ajenas = suyas.filter(
      (q) =>
        q.loteNumero !== null &&
        !liq.compras.some((c) => c.numero === q.loteNumero),
    );
    for (const numero of new Set(ajenas.map((q) => q.loteNumero)))
      avisos.push(
        `Hay cuotas del N° ${numero}, que ya no es una compra de este cliente: revisá el plan.`,
      );
  }
  return avisos;
};
