import { $, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { remateActivo, useAppState } from "~/components/app-state/app-state";
import { clienteVacio } from "~/components/cliente-form/cliente-form-state";
import type { FiltroClientes } from "~/components/clientes-table/clientes-filtro";
import {
  verClientes,
  verHistorial,
  type ClienteResumen,
  type Historial,
} from "~/db/clientes";
import { errorTxt } from "~/lib/textos";
import { useFotoClientes, useGuardarClientes } from "~/store";
import { useClienteBorrador } from "./use-cliente-borrador";
import { useSaldos } from "./use-saldos";

export const useClientesPage = () => {
  const { state } = useAppState();
  const foto = useFotoClientes();
  const clientes = useSignal<ClienteResumen[]>([]);
  // `cargar` goes back to the client chosen when the page was left.
  const seleccionado = useSignal<number | null>(foto?.seleccionado ?? null);
  const historial = useSignal<Historial>();
  const filtro = useSignal<FiltroClientes>(foto?.filtro ?? "todos");
  const error = useSignal<string>();
  const cargado = useSignal(false);
  const { form, editar: editarCliente } = useClienteBorrador();
  useGuardarClientes({ seleccionado, filtro });
  const activa = useComputed$(() => remateActivo(state));
  const actual = useComputed$(() =>
    clientes.value.find((c) => c.id === seleccionado.value),
  );
  const { saldos, deuda, leerSaldos } = useSaldos(clientes);

  const elegir = $(async (id: number) => {
    // Another client's history must not show under this one while it loads.
    if (seleccionado.value !== id) historial.value = undefined;
    seleccionado.value = id;
    try {
      const leido = await verHistorial(id);
      // Clicking another client meanwhile: its own answer counts.
      if (seleccionado.value === id) historial.value = leido;
    } catch (err) {
      if (seleccionado.value === id) error.value = errorTxt(err);
    }
  });

  const cargar = $(async (id?: number) => {
    try {
      clientes.value = await verClientes();
      error.value = undefined;
      const sigue = clientes.value.some((c) => c.id === seleccionado.value);
      const elegido =
        id ?? (sigue ? seleccionado.value : null) ?? clientes.value[0]?.id;
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
    editarCliente,
    elegir,
    cargar,
    nuevo,
  };
};

export type ClientesPageState = ReturnType<typeof useClientesPage>;
