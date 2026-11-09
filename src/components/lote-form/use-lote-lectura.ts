import {
  useComputed$,
  useSignal,
  useTask$,
  useVisibleTask$,
  type Signal,
} from "@builder.io/qwik";
import type { LotesPageState } from "~/components/lotes-page/use-lotes-page";
import { leerLote } from "~/db/lotes";
import { conCambios } from "~/lib/cambios";
import { errorTxt } from "~/lib/textos";
import { desdeLote, type LoteFormState } from "./lote-form-state";

/**
 * Fills the card from the database, never from the sheet on screen. A draft
 * from before another tab keeps only what the user changed.
 */
export const useLoteLectura = (
  page: LotesPageState,
  numero: number,
  form: LoteFormState,
  error: Signal<string | undefined>,
) => {
  /** What the database said, to tell what the user changed. */
  const base = useSignal<LoteFormState>();
  const cargando = useComputed$(() => !base.value);

  // Kept by the page while it's open, so it survives another tab.
  useTask$(({ track }) => {
    const desde = track(() => base.value);
    const actual = track(() => ({ ...form }));
    if (desde) page.borrador.value = { numero, base: desde, form: actual };
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const remateId = page.remateCargado.value;
    const antes = page.borrador.value;
    if (remateId === null) return;
    try {
      const fresco = desdeLote(await leerLote(remateId, numero));
      const propio = antes?.numero === numero ? antes : undefined;
      const lleno = conCambios(fresco, propio);
      Object.assign(form, lleno.form);
      base.value = lleno.base;
    } catch (err) {
      error.value = errorTxt(err);
      return;
    }
    // On the next frame, once the fields are enabled. The required fields
    // stay in view, above the first one to complete.
    requestAnimationFrame(() => {
      document.getElementById("lote-cantidad")?.focus({ preventScroll: true });
      document.getElementById("lote-form-cuerpo")?.scrollTo(0, 0);
    });
  });

  return { base, cargando };
};
