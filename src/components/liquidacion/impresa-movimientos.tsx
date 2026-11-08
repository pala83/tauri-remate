import { component$, useComputed$ } from "@builder.io/qwik";
import { cuotasDe } from "~/components/pagos/cuotas-de";
import { fechaCorta } from "~/lib/fechas";
import { pesos } from "~/lib/textos";
import type { LiquidacionState } from "./use-liquidacion";

const TITULO = "mb-1.5 font-mono text-xs tracking-widest uppercase";
const FILA = "border-sidebar-border grid gap-x-2.5 border-b font-mono text-xs";

/** The installments and payments of the printed settlement, if there are any. */
export const ImpresaMovimientos = component$<{ estado: LiquidacionState }>(
  ({ estado }) => {
    const cuotas = useComputed$(() => cuotasDe(estado));

    return (
      <>
        {cuotas.value.length > 0 && (
          <section>
            <p class={TITULO}>Cuotas</p>
            {cuotas.value.map(({ cuota, orden, estado: est }) => (
              <div
                key={cuota.id}
                class={`${FILA} grid-cols-[5rem_10rem_minmax(0,1fr)_7rem]`}
              >
                <span>Cuota {orden}</span>
                <span>vence {fechaCorta(cuota.vence)}</span>
                <span>{est}</span>
                <span class="text-right font-bold">{pesos(cuota.monto)}</span>
              </div>
            ))}
          </section>
        )}
        {(estado.liq.value?.pagos.length ?? 0) > 0 && (
          <section>
            <p class={TITULO}>Pagos</p>
            {estado.liq.value?.pagos.map((pago) => (
              <div
                key={pago.id}
                class={`${FILA} grid-cols-[6rem_4rem_minmax(0,1fr)_7rem]`}
              >
                <span>{fechaCorta(pago.fecha)}</span>
                <span>{pago.sentido}</span>
                <span class="truncate">
                  {pago.medio}
                  {pago.referencia ? ` · ${pago.referencia}` : ""}
                  {pago.anulado ? " · anulado" : ""}
                </span>
                <span
                  class={[
                    "text-right font-bold",
                    pago.anulado && "line-through",
                  ]}
                >
                  {pesos(pago.monto)}
                </span>
              </div>
            ))}
          </section>
        )}
      </>
    );
  },
);
