import { useFoto, useGuardar, type Campos } from "./memoria";

const CLAVE = "carga-rapida";

/** The quick entry's article and owner, in remate `remate`. */
export type FotoCargaRapida = {
  remate: number | null;
  articulo: string;
  duenoId: number | null;
  /** The owner it started with: only one the user picked comes back. */
  duenoBase: number | null;
};

export const useFotoCargaRapida = () => useFoto<FotoCargaRapida>(CLAVE);

export const useGuardarCargaRapida = (campos: Campos<FotoCargaRapida>) =>
  useGuardar(CLAVE, campos);
