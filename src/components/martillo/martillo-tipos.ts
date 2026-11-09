import type { PagoLote } from "~/db/schema";
import type { VentaLote } from "~/db/ventas";
import type { CamposVenta } from "~/lib/martillo-campos";

/** The hammer's fields as read from the database for lot `numero`. */
export type BaseVenta = CamposVenta & { numero: number | null };

export type MensajeMartillo = {
  tipo: "ok" | "error" | "info";
  texto: string;
};

export type Deshacer = {
  ventas: VentaLote[];
  pagos: PagoLote[];
  numero: number;
};
