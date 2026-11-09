import { useFoto, useGuardar, type Campos } from "./memoria";

const CLAVE = "liquidacion";

/** The remate whose settlement was shown, for that client only. */
export type FotoLiquidacion = {
  clienteId: number | undefined;
  remateId: number | null;
};

export const useFotoLiquidacion = () => useFoto<FotoLiquidacion>(CLAVE);

export const useGuardarLiquidacion = (campos: Campos<FotoLiquidacion>) =>
  useGuardar(CLAVE, campos);
