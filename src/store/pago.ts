import type { PagoFormState } from "~/components/pagos/pago-form-state";
import { useFoto, useGuardar, type Campos } from "./memoria";

const CLAVE = "pago";

/** The payment being written, in the settlement `liqId`. */
export type FotoPago = {
  liqId: number;
  /** The balance and direction the amount was last suggested for. */
  sugerido: string;
  form: PagoFormState;
};

export const useFotoPago = () => useFoto<FotoPago>(CLAVE);

export const useGuardarPago = (campos: Campos<FotoPago>) =>
  useGuardar(CLAVE, campos);
