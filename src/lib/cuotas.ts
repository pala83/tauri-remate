import type { Cuota } from "~/db/schema";

export type EstadoCuota = "pagada" | "vencida" | "parcial" | "pendiente";

export const estadoCuota = (
  cuota: Cuota,
  pagado: number,
  hoy: Date,
): EstadoCuota => {
  if (pagado >= cuota.monto) return "pagada";
  if (cuota.vence < hoy) return "vencida";
  return pagado > 0 ? "parcial" : "pendiente";
};

/** Equal installments; the last one takes what doesn't divide evenly. */
export const repartirCuotas = (total: number, plazos: number[], desde: Date) => {
  const ordenados = [...plazos].sort((a, b) => a - b);
  const cuota = ordenados.length ? Math.floor(total / ordenados.length) : 0;
  return ordenados.map((plazoDias, i) => {
    const vence = new Date(desde);
    vence.setDate(vence.getDate() + plazoDias);
    const ultima = i === ordenados.length - 1;
    return {
      plazoDias,
      vence,
      monto: ultima ? total - cuota * (ordenados.length - 1) : cuota,
    };
  });
};
