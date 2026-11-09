import { aInputFecha } from "~/lib/fechas";

export type PagoFormState = {
  sentido: "cobro" | "pago";
  fecha: string;
  monto: string;
  medio: "efectivo" | "transferencia" | "cheque" | "otro";
  referencia: string;
  acredita: string;
  aplica: "cuenta" | "lotes" | "cuota";
  lotes: number[];
  cuotaId: number | null;
};

export const vacio = (sentido: PagoFormState["sentido"]): PagoFormState => ({
  sentido,
  fecha: aInputFecha(new Date()),
  monto: "",
  medio: "efectivo",
  referencia: "",
  acredita: "",
  aplica: "cuenta",
  lotes: [],
  cuotaId: null,
});
