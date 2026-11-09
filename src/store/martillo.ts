import type { FiltroMartillo } from "~/lib/martillo";
import type { CamposVenta } from "~/lib/martillo-campos";
import { useFoto, useGuardar, type Campos } from "./memoria";

const CLAVE = "martillo";

/** The lot in the hammer and its sale not yet awarded, in remate `remate`. */
export type FotoMartillo = {
  remate: number | null;
  filtro: FiltroMartillo;
  numero: number | null;
  precio: string;
  compradorId: number | null;
  comisionCompra: string;
  comisionVenta: string;
  grupo: number[];
  recientes: number[];
  ultimo: string | undefined;
  /** What the database said for the lot: only fields changed from it come back. */
  base: CamposVenta | null;
};

export const useFotoMartillo = () => useFoto<FotoMartillo>(CLAVE);

export const useGuardarMartillo = (campos: Campos<FotoMartillo>) =>
  useGuardar(CLAVE, campos);
