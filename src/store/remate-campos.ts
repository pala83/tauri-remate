import { $ } from "@builder.io/qwik";
import type { RemateCampos } from "~/lib/remates";
import { useFoto, useGuardar, useMemoria, type Campos } from "./memoria";

/** One form each: creating a remate, and editing the active one. */
export type ClaveRemate = "remate-nuevo" | "remate-editar";

/**
 * A remate's fields as they were written; `id` is the remate edited, and
 * `base` what the database said for it: only fields changed from it come back.
 */
export type FotoRemate = RemateCampos & {
  id: number | null;
  base: RemateCampos | null;
};

export const useFotoRemate = (clave: ClaveRemate) => useFoto<FotoRemate>(clave);

export const useGuardarRemate = (
  clave: ClaveRemate,
  campos: Campos<FotoRemate>,
) => useGuardar(clave, campos);

/** Drops what was written, for a form that's saved or cancelled as it closes. */
export const useOlvidarRemate = (clave: ClaveRemate) => {
  const memoria = useMemoria();
  return $(() => {
    delete memoria[clave];
  });
};
