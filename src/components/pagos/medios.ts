import type { Pago } from "~/db/schema";

/** How each payment method is named: the form, the list and the printed settlement. */
export const MEDIOS: Record<Pago["medio"], string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  cheque: "Cheque",
  otro: "Otro medio",
};
