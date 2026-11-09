import { useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { leerLiquidacion } from "~/db/liquidaciones";
import type { LiquidacionState } from "./use-liquidacion";

/** The settlement's notes for their field, read from the database. */
export const useNotas = (estado: LiquidacionState) => {
  const notas = useSignal<string>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    const id = track(() => estado.liq.value?.liq?.id);
    notas.value = undefined;
    if (id === undefined) return;
    const leida = await leerLiquidacion(id);
    if (estado.liq.value?.liq?.id === id) notas.value = leida.notas ?? "";
  });

  return notas;
};
