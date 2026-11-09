import { olvidarLotes } from "./olvidos";
import type { PagoLote } from "./schema";

export type VentaLote = {
  numero: number;
  compradorId: number | null;
  precioVenta: number | null;
  vendidoCon: number | null;
  comisionCompra: number;
  comisionVenta: number;
};

type Cambios = {
  /** Lots whose buyer changes: what was paid for them stays on the old buyer's account. */
  soltar?: number[];
  /** Payment rows put back, when undoing. */
  devolver?: PagoLote[];
};

/**
 * Writes a sale that changes several lots, all at once or not at all: it's the
 * `escribir_ventas` Rust command because the plugin's pool can't hold a
 * transaction. Lots sold with one of these take its buyer. Returns the payment
 * rows it removed, which `devolver` puts back.
 */
export async function escribirVentas(
  remateId: number,
  ventas: VentaLote[],
  { soltar = [], devolver = [] }: Cambios = {},
) {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<PagoLote[]>("escribir_ventas", {
    remateId,
    ventas,
    soltar,
    devolver,
  }).finally(() => olvidarLotes(remateId));
}
