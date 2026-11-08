import {
  $,
  useComputed$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import { remateActivo, useAppState } from "~/components/app-state/app-state";
import { clienteVacio } from "~/components/cliente-form/cliente-form-state";
import type { FiltroClientes } from "~/components/clientes-table/clientes-filtro";
import {
  historialCliente,
  listarClientes,
  type ClienteResumen,
  type Historial,
} from "~/db/clientes";
import { useSaldos } from "./use-saldos";
import { errorTxt } from "~/lib/textos";

export const useClientesPage = () => {
  const { state } = useAppState();
  const clientes = useSignal<ClienteResumen[]>([]);
  const seleccionado = useSignal<number | null>(null);
  const historial = useSignal<Historial>();
  const filtro = useSignal<FiltroClientes>("todos");
  const error = useSignal<string>();
  const cargado = useSignal(false);
  const form = useStore(clienteVacio());
  const activa = useComputed$(() => remateActivo(state));
  const actual = useComputed$(() =>
    clientes.value.find((c) => c.id === seleccionado.value),
  );
  const { saldos, deuda, leerSaldos } = useSaldos(clientes);

  const elegir = $(async (id: number) => {
    seleccionado.value = id;
    try {
      historial.value = await historialCliente(id);
    } catch (err) {
      error.value = errorTxt(err);
    }
  });

  const cargar = $(async (id?: number) => {
    try {
      clientes.value = await listarClientes();
      error.value = undefined;
      const elegido = id ?? seleccionado.value ?? clientes.value[0]?.id;
      if (elegido !== undefined) await elegir(elegido);
    } catch (err) {
      error.value = errorTxt(err);
    }
    cargado.value = true;
  });

  const nuevo = $(() => {
    Object.assign(form, clienteVacio());
  });

  // The database only exists inside the Tauri webview, so load on the client.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => state.activoId);
    try {
      await Promise.all([cargar(), leerSaldos()]);
    } catch (err) {
      error.value = errorTxt(err);
    }
  });

  return {
    cargado,
    clientes,
    activa,
    actual,
    saldos,
    deuda,
    leerSaldos,
    seleccionado,
    historial,
    filtro,
    error,
    form,
    elegir,
    cargar,
    nuevo,
  };
};

export type ClientesPageState = ReturnType<typeof useClientesPage>;
