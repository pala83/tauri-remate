import { useFoto, useGuardar, type Campos } from "./memoria";

const CLAVE = "plan-cuotas";

/** What the plan form had, while it's open. */
export type BorradorPlan = {
  plazos: number[];
  lote: number | null;
  porLote: boolean;
  monto: string;
};

/** Whether the plan form was open in the settlement `liqId`, and what it had. */
export type FotoPlanCuotas = {
  liqId: number;
  abierto: boolean;
  borrador: BorradorPlan | null;
};

export const useFotoPlanCuotas = () => useFoto<FotoPlanCuotas>(CLAVE);

export const useGuardarPlanCuotas = (campos: Campos<FotoPlanCuotas>) =>
  useGuardar(CLAVE, campos);
