import { useSignal, useVisibleTask$, type Signal } from "@builder.io/qwik";
import type { LiquidacionState } from "~/components/liquidacion/use-liquidacion";
import { montoSugerido } from "~/components/liquidacion/saldo";
import type { PagoFormState } from "./pago-form-state";

/**
 * The amount starts as the whole balance, so paying it all needs nothing
 * typed. The balance is read from the database, not the one on screen. Only
 * when it or the direction changes: coming back keeps what was typed, and
 * emptying `sugerido` asks for it again.
 */
export const useMontoSugerido = (
  estado: LiquidacionState,
  form: PagoFormState,
  sugerido: Signal<string>,
  /** Without a draft: the direction is a payment if the client is owed. */
  conSentido: boolean,
) => {
  const falta = useSignal(conSentido);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => estado.liq.value?.saldo);
    const sentido = track(() => form.sentido);
    track(() => sugerido.value);
    const vigente = await estado.vigente();
    // The direction changed while it read: that change asks again.
    if (!vigente || form.sentido !== sentido) return;
    if (falta.value) {
      falta.value = false;
      const propio = vigente.liq.neto < 0 ? "pago" : "cobro";
      if (propio !== sentido) return void (form.sentido = propio);
    }
    const clave = `${vigente.liq.saldo}|${sentido}`;
    if (sugerido.value === clave) return;
    sugerido.value = clave;
    form.monto = montoSugerido(vigente.liq.saldo, sentido);
  });
};
