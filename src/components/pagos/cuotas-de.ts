import type { Cuota } from "~/db/schema";
import { estadoCuota } from "~/lib/cuotas";
import type { Liquidado } from "~/lib/liquidacion";

/** The installments of the settlement in view, with what's been paid of each. */
export const cuotasDe = (liq: Liquidado | null, cuotas: Cuota[]) => {
  if (!liq?.liq) return [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return cuotas
    .filter((q) => q.liquidacionId === liq.liq!.id)
    .map((cuota, i) => {
      const pagado = liq.pagos
        .filter((p) => !p.anulado && p.cuotaId === cuota.id)
        .reduce((suma, p) => suma + p.monto, 0);
      return {
        cuota,
        orden: i + 1,
        pagado,
        resta: Math.max(0, cuota.monto - pagado),
        estado: estadoCuota(cuota, pagado, hoy),
      };
    });
};
