import { $, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { clienteVacio } from "~/components/cliente-form/cliente-form-state";
import type { FiltroClientes } from "~/components/clientes-table/clientes-filtro";
import {
  historialCliente,
  listarClientes,
  type ClienteResumen,
  type Historial,
} from "~/db/clientes";
import { irA } from "~/lib/scroll";
import { errorTxt, titulo } from "~/lib/textos";

export const useClientesPage = () => {
  const clientes = useSignal<ClienteResumen[]>([]);
  const seleccionado = useSignal<number | null>(null);
  const historial = useSignal<Historial>();
  const filtro = useSignal<FiltroClientes>("todos");
  const error = useSignal<string>();
  const cargado = useSignal(false);
  const form = useStore(clienteVacio());

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

  const editar = $((cliente: ClienteResumen) => {
    Object.assign(form, {
      id: cliente.id,
      nombre: titulo(cliente.nombre),
      telefono: cliente.telefono ?? "",
      email: cliente.email ?? "",
      referido: titulo(cliente.referido ?? ""),
    });
    irA("nuevo-cliente", "cliente-nombre");
  });

  // The database only exists inside the Tauri webview, so load on the client.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => cargar());

  return {
    cargado,
    clientes,
    seleccionado,
    historial,
    filtro,
    error,
    form,
    elegir,
    cargar,
    nuevo,
    editar,
  };
};
