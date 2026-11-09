import type { FiltroClientes } from "~/components/clientes-table/clientes-filtro";
import { useFoto, useGuardar, type Campos } from "./memoria";

const CLAVE = "clientes";

/** The client chosen and the list's filter. */
export type FotoClientes = {
  seleccionado: number | null;
  filtro: FiltroClientes;
};

export const useFotoClientes = () => useFoto<FotoClientes>(CLAVE);

export const useGuardarClientes = (campos: Campos<FotoClientes>) =>
  useGuardar(CLAVE, campos);
