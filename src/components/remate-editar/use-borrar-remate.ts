import { $, useSignal, type QRL, type Signal } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { useAppState } from "~/components/app-state/app-state";
import {
  borrarRemate,
  contarDelRemate,
  motivoParaNoBorrar,
} from "~/db/remates";
import { errorTxt } from "~/lib/textos";

/**
 * Deleting the remate being edited: only one with no lots and no clients.
 * Both checks read the database at that moment, and it refuses anything else.
 */
export const useBorrarRemate = (
  id: number,
  olvidar: QRL<() => void>,
  error: Signal<string | undefined>,
) => {
  const { recargar$ } = useAppState();
  const navegar = useNavigate();
  const abierto = useSignal(false);
  const borrando = useSignal(false);

  /** Asks first, unless it already can't be deleted: then says why. */
  const pedir = $(async () => {
    try {
      const motivo = motivoParaNoBorrar(await contarDelRemate(id));
      error.value = motivo;
      abierto.value = !motivo;
    } catch (err) {
      error.value = errorTxt(err);
    }
  });

  const borrar = $(async () => {
    if (borrando.value) return;
    borrando.value = true;
    abierto.value = false;
    try {
      await borrarRemate(id);
      await olvidar();
      // Another remate becomes the active one.
      await recargar$();
      await navegar("/");
    } catch (err) {
      error.value = errorTxt(err);
    } finally {
      borrando.value = false;
    }
  });

  return { abierto, borrando, pedir, borrar };
};
