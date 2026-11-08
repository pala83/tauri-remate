import { $, useVisibleTask$, type Signal } from "@builder.io/qwik";
import { useAppState } from "~/components/app-state/app-state";
import type { PlanillaVirtual } from "~/components/lotes-planilla/use-planilla-virtual";
import { listarClientes, type ClienteResumen } from "~/db/clientes";
import { leerDatosRemate } from "~/db/liquidaciones";
import type { DatosRemate } from "~/lib/liquidacion";
import {
  filtrarMartillo,
  proximoSinVender,
  ultimosCompradores,
  type FiltroMartillo,
} from "~/lib/martillo";
import { COMISION_DEFECTO } from "~/lib/martillo-ventas";
import { campoComision, errorTxt } from "~/lib/textos";
import type { Deshacer, MensajeMartillo } from "./use-martillo";

const RECIENTES = 5;

type Estado = {
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
  virtual: PlanillaVirtual;
};

export const useMartilloCarga = (e: Estado) => {
  const { state } = useAppState();
  const { datos, clientes, filtro, numero, precio, compradorId } = e;
  const { comisionCompra, comisionVenta } = e;
  const { grupo, recientes, mensaje, deshacer, virtual } = e;

  /** Puts a lot in the hammer, with what's already saved of its sale. */
  const cargarLote = $((n: number | null) => {
    // Read from `datos`: the computed lists lag behind a change just made.
    const lista = datos.value?.lotes ?? [];
    numero.value = n;
    const l = lista.find((x) => x.numero === n);
    precio.value = l?.precioVenta ? String(l.precioVenta) : "";
    compradorId.value = l?.compradorId ?? null;
    // Only a sold lot keeps its own: any new sale starts from the default.
    const conVenta = l && l.compradorId !== null;
    comisionCompra.value = campoComision(
      conVenta ? l.comisionCompra : COMISION_DEFECTO,
    );
    comisionVenta.value = campoComision(
      conVenta ? l.comisionVenta : COMISION_DEFECTO,
    );
    grupo.value = lista.filter((x) => x.vendidoCon === n).map((x) => x.numero);
    if (n === null) return;
    const fila = filtrarMartillo(lista, filtro.value).findIndex(
      (x) => x.numero === n,
    );
    if (fila !== -1) virtual.destino.value = { fila };
  });

  const leer = $(async () => {
    const id = state.activoId;
    datos.value = id === null ? undefined : await leerDatosRemate(id);
  });

  // The database only exists in the webview, so this loads on the client.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => state.activoId);
    mensaje.value = undefined;
    deshacer.value = undefined;
    try {
      clientes.value = await listarClientes();
      await leer();
      const lista = datos.value?.lotes ?? [];
      recientes.value = ultimosCompradores(lista, RECIENTES);
      await cargarLote(proximoSinVender(lista, 0)?.numero ?? null);
    } catch (err) {
      mensaje.value = { tipo: "error", texto: errorTxt(err) };
    }
  });

  return { cargarLote, leer };
};
