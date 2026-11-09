import type { ClienteFormState } from "~/components/cliente-form/cliente-form-state";
import { useFoto, useGuardar, type Campos } from "./memoria";

const CLAVE = "cliente-form";

/**
 * The client form being written. Editing a client, `base` is what the
 * database said when it was filled: only fields changed from it come back.
 */
export type FotoClienteForm = {
  form: ClienteFormState;
  base: ClienteFormState | null;
};

export const useFotoClienteForm = () => useFoto<FotoClienteForm>(CLAVE);

export const useGuardarClienteForm = (campos: Campos<FotoClienteForm>) =>
  useGuardar(CLAVE, campos);
