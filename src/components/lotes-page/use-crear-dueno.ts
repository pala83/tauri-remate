import { $, type Signal } from "@builder.io/qwik";
import {
  crearCliente,
  listarClientes,
  type ClienteResumen,
} from "~/db/clientes";

/** A new owner or buyer typed in a search: the list is read again with it. */
export const useCrearDueno = (clientes: Signal<ClienteResumen[]>) =>
  $(async (nombre: string) => {
    const id = await crearCliente({ nombre });
    clientes.value = await listarClientes();
    return id;
  });
