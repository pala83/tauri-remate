import { $ } from "@builder.io/qwik";
import type { ClienteResumen } from "~/db/clientes";
import { editarLiquidacion, generarLiquidacion } from "~/db/liquidaciones";
import type { LiquidacionState } from "./use-liquidacion";

export const useLiquidacionAcciones = (
  estado: LiquidacionState,
  cliente: { value: ClienteResumen | undefined },
) => {
  const { hacer, liq, mensaje, remateId } = estado;

  const generar = $(async () => {
    const c = cliente.value;
    if (!c || remateId.value === null) return;
    const id = remateId.value;
    await hacer($(() => generarLiquidacion(id, c.id, c.sinComision)));
    mensaje.value = {
      tipo: "ok",
      texto: "Liquidación generada: ya se pueden registrar pagos.",
    };
  });

  const cambiarSinComision = $(async () => {
    const q = liq.value?.liq;
    if (q)
      await hacer(
        $(() => editarLiquidacion(q.id, { sinComision: !q.sinComision })),
      );
  });

  const guardarNotas = $(async (notas: string) => {
    const q = liq.value?.liq;
    if (q && notas !== (q.notas ?? ""))
      await hacer($(() => editarLiquidacion(q.id, { notas: notas || null })));
  });

  return { generar, cambiarSinComision, guardarNotas };
};
