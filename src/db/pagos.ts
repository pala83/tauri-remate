import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { olvidarPagos } from "./olvidos";
import { cuotas, pagos, type NewCuota, type NewPago } from "./schema";

/** A single INSERT: the plan is saved whole or not at all. */
export async function guardarCuotas(filas: NewCuota[]) {
  const db = await getDb();
  await db.insert(cuotas).values(filas).finally(olvidarPagos);
}

export type LotePagado = {
  remateId: number;
  loteNumero: number;
  monto: number;
};

/** In Rust because it's two tables, and the plugin's pool can't hold a transaction. */
export async function registrarPago(pago: NewPago, cubre: LotePagado[]) {
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("registrar_pago", {
    pago: {
      ...pago,
      fecha: Math.floor(pago.fecha.getTime() / 1000),
      acredita: pago.acredita
        ? Math.floor(pago.acredita.getTime() / 1000)
        : null,
    },
    lotes: cubre,
  }).finally(olvidarPagos);
}

export async function anularPago(id: number) {
  const db = await getDb();
  await db
    .update(pagos)
    .set({ anulado: true })
    .where(eq(pagos.id, id))
    .finally(olvidarPagos);
}
