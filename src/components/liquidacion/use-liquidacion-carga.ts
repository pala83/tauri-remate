import { $, useSignal, useVisibleTask$, type Signal } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import type { Mensaje } from "~/components/page-columns/form-message";
import {
  verDatosRemate,
  verRematesDeCliente,
  type RemateDeCliente,
} from "~/db/liquidaciones";
import type { DatosRemate } from "~/lib/liquidacion";
import { errorTxt } from "~/lib/textos";
import { useFotoLiquidacion, useGuardarLiquidacion } from "~/store";

type Estado = {
  /** A computed: it only notifies when the client changes, not on every reload of the list. */
  clienteId: Signal<number | undefined>;
  remates: Signal<RemateDeCliente[]>;
  remateId: Signal<number | null>;
  datos: Signal<DatosRemate | undefined>;
  mensaje: Signal<Mensaje | undefined>;
};

/** Reads the client's remates and the chosen one's data, dropping answers that came too late. */
export const useLiquidacionCarga = (e: Estado) => {
  const { state } = useAppState();
  const { clienteId, remates, remateId, datos, mensaje } = e;
  // Only for the first load: later on, the remate chosen meanwhile counts.
  const foto = useSignal(useFotoLiquidacion());
  useGuardarLiquidacion({ clienteId, remateId });

  const leer = $(async () => {
    const id = remateId.value;
    const leidos = id === null ? undefined : await verDatosRemate(id);
    // Another remate or client was chosen meanwhile: its own read counts.
    if (remateId.value === id) datos.value = leidos;
  });

  const elegirRemate = $(async (id: number) => {
    remateId.value = id;
    mensaje.value = undefined;
    try {
      await leer();
    } catch (err) {
      mensaje.value = { tipo: "error", texto: errorTxt(err) };
    }
  });

  // The database only exists in the webview, so this loads on the client.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    const id = track(() => clienteId.value);
    const activo = track(() => state.activoId);
    mensaje.value = undefined;
    datos.value = undefined;
    remateId.value = null;
    if (id === undefined) return;
    const vigente = () => clienteId.value === id && state.activoId === activo;
    try {
      const lista = await verRematesDeCliente(id);
      if (!vigente()) return;
      remates.value = lista;
      // The remate chosen for this client before leaving the page, if any.
      const antes = foto.value?.clienteId === id ? foto.value.remateId : null;
      foto.value = undefined;
      const hay = (r: number | null) => lista.some((x) => x.id === r);
      remateId.value = hay(antes)
        ? antes
        : hay(activo)
          ? activo
          : (lista[0]?.id ?? null);
      await leer();
    } catch (err) {
      if (vigente()) mensaje.value = { tipo: "error", texto: errorTxt(err) };
    }
  });

  return { leer, elegirRemate };
};
