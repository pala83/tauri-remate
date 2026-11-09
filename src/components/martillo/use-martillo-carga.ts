import { $, useVisibleTask$, type Signal } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import type { PlanillaVirtual } from "~/components/lotes-planilla/use-planilla-virtual";
import { verClientes, type ClienteResumen } from "~/db/clientes";
import { verDatosRemate } from "~/db/liquidaciones";
import type { DatosRemate } from "~/lib/liquidacion";
import {
  proximoSinVender,
  ultimosCompradores,
  type FiltroMartillo,
} from "~/lib/martillo";
import { RECIENTES } from "~/lib/martillo-ventas";
import { errorTxt } from "~/lib/textos";
import type { FotoMartillo } from "~/store";
import type { BaseVenta, Deshacer, MensajeMartillo } from "./martillo-tipos";
import { useCargarLote } from "./use-cargar-lote";
import { useMartilloMemoria } from "./use-martillo-memoria";

type Estado = {
  foto: FotoMartillo | undefined;
  datos: Signal<DatosRemate | undefined>;
  clientes: Signal<ClienteResumen[]>;
  filtro: Signal<FiltroMartillo>;
  numero: Signal<number | null>;
  precio: Signal<string>;
  compradorId: Signal<number | null>;
  comisionCompra: Signal<string>;
  comisionVenta: Signal<string>;
  grupo: Signal<number[]>;
  recientes: Signal<number[]>;
  mensaje: Signal<MensajeMartillo | undefined>;
  deshacer: Signal<Deshacer | undefined>;
  ultimo: Signal<string | undefined>;
  recien: Signal<number | null>;
  base: Signal<BaseVenta | undefined>;
  virtual: PlanillaVirtual;
};

export const useMartilloCarga = (e: Estado) => {
  const { state } = useAppState();
  const { datos, clientes, recientes, mensaje, deshacer, ultimo, recien } = e;

  const cargarLote = useCargarLote(e);
  const { volver } = useMartilloMemoria(e, cargarLote);

  const leer = $(async () => {
    const id = state.activoId;
    const leidos = id === null ? undefined : await verDatosRemate(id);
    // Another remate was chosen meanwhile: its own read counts.
    if (state.activoId === id) datos.value = leidos;
    return leidos;
  });

  // The database only exists in the webview, so this loads on the client.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    const id = track(() => state.activoId);
    mensaje.value = undefined;
    deshacer.value = undefined;
    ultimo.value = undefined;
    recien.value = null;
    datos.value = undefined;
    try {
      clientes.value = await verClientes();
      const leidos = await leer();
      if (state.activoId !== id) return;
      if (await volver(id)) return;
      const lista = leidos?.lotes ?? [];
      recientes.value = ultimosCompradores(lista, RECIENTES);
      await cargarLote(proximoSinVender(lista, 0)?.numero ?? null);
    } catch (err) {
      if (state.activoId === id)
        mensaje.value = { tipo: "error", texto: errorTxt(err) };
    }
  });

  return { cargarLote, leer };
};
