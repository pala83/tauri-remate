import { useSignal, useTask$ } from "@builder.io/qwik";
import type { Mensaje } from "~/components/page-columns/form-message";
import {
  useFotoPlanCuotas,
  useGuardarPlanCuotas,
  type BorradorPlan,
} from "~/store";

/** Whether the plan form is open, and what it has: both survive a tab change. */
export const usePlanCuotas = (liqId: number) => {
  const foto = useFotoPlanCuotas();
  const propia = foto?.liqId === liqId ? foto : undefined;
  const abierto = useSignal(propia?.abierto ?? false);
  const borrador = useSignal<BorradorPlan | null>(propia?.borrador ?? null);
  const mensaje = useSignal<Mensaje>();
  useGuardarPlanCuotas({ liqId, abierto, borrador });

  // Opening it again, after saving or closing it, starts from scratch.
  useTask$(({ track }) => {
    if (!track(() => abierto.value)) borrador.value = null;
  });

  return { abierto, borrador, mensaje };
};

export type PlanCuotasState = ReturnType<typeof usePlanCuotas>;
