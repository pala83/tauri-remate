import type { LoteConClientes } from "~/db/lotes";
import type { PagoLote } from "~/db/schema";
import { pesos, titulo } from "./textos";

type Lote = LoteConClientes;

export const avisosVenta = (
  lote: Lote,
  lotes: Lote[],
  grupo: number[],
  compradorId: number | null,
  precio: number,
  pagoLotes: PagoLote[],
) => {
  const lista: string[] = [];
  const dueno = titulo(lote.duenoNombre);
  for (const n of grupo) {
    const otro = lotes.find((l) => l.numero === n);
    if (otro && otro.duenoId !== lote.duenoId) {
      const suyo = titulo(otro.duenoNombre);
      lista.push(
        `El N° ${n} es de ${suyo} y el precio queda en el N° ${lote.numero}, de ${dueno}: ${suyo} no cobraría su parte.`,
      );
    }
  }
  if (compradorId === lote.duenoId)
    lista.push(
      "El comprador es el dueño del lote: paga comisión de compra y de venta.",
    );
  if (precio && lote.precioBase && precio < lote.precioBase)
    lista.push(
      `El precio está por debajo de la base (${pesos(lote.precioBase)}).`,
    );
  const pagado = pagoLotes
    .filter((pl) => pl.loteNumero === lote.numero)
    .reduce((suma, pl) => suma + pl.monto, 0);
  if (pagado && lote.compradorNombre && compradorId !== lote.compradorId)
    lista.push(
      `${titulo(lote.compradorNombre)} ya pagó ${pesos(pagado)} de este lote: si cambia el comprador, ese dinero le queda a cuenta.`,
    );
  return lista;
};
