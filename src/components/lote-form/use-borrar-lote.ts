import { $, useSignal, type Signal } from "@builder.io/qwik";
import type { LotesPageState } from "~/components/lotes-page/use-lotes-page";
import { borrarLote, leerLote } from "~/db/lotes";
import { errorTxt, titulo } from "~/lib/textos";

/**
 * Deleting the lot in the card: only one whose sale isn't registered. Both
 * checks read the database at that moment, and it refuses a sold lot anyway.
 */
export const useBorrarLote = (
  page: LotesPageState,
  numero: number,
  error: Signal<string | undefined>,
) => {
  const abierto = useSignal(false);
  const borrando = useSignal(false);
  /** What the dialog says is deleted, from the same read. */
  const texto = useSignal("");
  const sinBorrar = `No se puede eliminar el N° ${numero}: tiene la compra registrada.`;

  /** Asks first, unless it's sold: then says why. */
  const pedir = $(async () => {
    const remateId = page.remateCargado.value;
    if (remateId === null) return;
    try {
      const lote = await leerLote(remateId, numero);
      if (lote.compradorId !== null) {
        error.value = sinBorrar;
        return;
      }
      texto.value = `«${lote.nombre}», de ${titulo(lote.duenoNombre)}`;
      error.value = undefined;
      abierto.value = true;
    } catch (err) {
      error.value = errorTxt(err);
    }
  });

  const borrar = $(async () => {
    const remateId = page.remateCargado.value;
    if (remateId === null || borrando.value) return;
    borrando.value = true;
    abierto.value = false;
    try {
      await borrarLote(remateId, numero);
      // Out of the sheet; the card closes and its draft goes with it.
      await page.quitarLote(numero);
      page.mensaje.value = {
        tipo: "info",
        texto: `N° ${numero} eliminado.`,
      };
    } catch (err) {
      error.value = errorTxt(err);
    } finally {
      borrando.value = false;
    }
  });

  return { abierto, borrando, texto, pedir, borrar };
};
