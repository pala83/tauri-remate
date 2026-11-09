import type { LoteFormState } from "~/components/lote-form/lote-form-state";
import type { FiltroLotes } from "~/lib/lotes";
import { useFoto, useGuardar, type Campos } from "./memoria";

const CLAVE = "lotes";

/**
 * The lot card being edited and what it had, unsaved. `base` is what the
 * database said when it opened: only fields changed from it come back.
 */
export type BorradorLote = {
  numero: number;
  base: LoteFormState;
  form: LoteFormState;
};

/** The sheet as it was left. Only `remate` gets the rest back. */
export type FotoLotes = {
  remate: number | null;
  busqueda: string;
  filtro: FiltroLotes;
  ficha: number | null;
  borrador: BorradorLote | null;
  /** The first row in view. */
  inicio: number;
};

export const useFotoLotes = () => useFoto<FotoLotes>(CLAVE);

export const useGuardarLotes = (campos: Campos<FotoLotes>) =>
  useGuardar(CLAVE, campos);
