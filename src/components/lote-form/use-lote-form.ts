import { $, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { LotesPageState } from "~/components/lotes-page/use-lotes-page";
import { editarLote } from "~/db/lotes";
import { sinDetalles } from "~/lib/lotes";
import { errorTxt } from "~/lib/textos";
import { aValores, desdeLote, errorDeLote, loteVacio } from "./lote-form-state";

export const useLoteForm = (page: LotesPageState, numero: number) => {
  const lote = page.lotes.value.find((l) => l.numero === numero);
  const form = useStore(lote ? desdeLote(lote) : loteVacio());
  const error = useSignal<string>();

  const cerrar = $(() => {
    page.ficha.value = null;
    document.getElementById("carga-articulo")?.focus();
  });

  const guardar = $(async (seguir: boolean) => {
    const remateId = page.remateCargado.value;
    error.value = errorDeLote(form);
    if (error.value || remateId === null) return;
    try {
      await editarLote(remateId, numero, aValores(form));
      await page.refrescarLote(remateId, numero);
    } catch (err) {
      error.value = errorTxt(err);
      return;
    }
    const lotes = page.lotes.value;
    const proximo = seguir
      ? (lotes.find((l) => l.numero > numero && sinDetalles(l)) ??
        lotes.find((l) => l.numero !== numero && sinDetalles(l)))
      : undefined;
    page.mensaje.value = {
      tipo: "info",
      texto:
        seguir && !proximo
          ? `N° ${numero} guardado. No quedan lotes sin detalles.`
          : `N° ${numero} actualizado.`,
    };
    if (!proximo) return cerrar();
    page.ficha.value = proximo.numero;
    const fila = page.filas.value.findIndex((l) => l.numero === proximo.numero);
    if (fila !== -1) page.virtual.destino.value = { fila };
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    // On the next frame, once the panel has a size. The required fields stay
    // in view, above the first one to complete.
    const frame = requestAnimationFrame(() => {
      document.getElementById("lote-cantidad")?.focus({ preventScroll: true });
      document.getElementById("lote-form-cuerpo")?.scrollTo(0, 0);
    });
    cleanup(() => cancelAnimationFrame(frame));
  });

  return { form, error, cerrar, guardar };
};
