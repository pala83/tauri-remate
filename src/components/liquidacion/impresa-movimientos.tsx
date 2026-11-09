import { component$ } from "@builder.io/qwik";
import { MEDIOS } from "~/components/pagos/medios";
import { fechaCorta } from "~/lib/fechas";
import { pesos } from "~/lib/textos";
import type { Vigente } from "./vigente";

const TITULO = "mb-1.5 font-mono text-xs tracking-widest uppercase";
const FILA = "border-sidebar-border grid gap-x-2.5 border-b font-mono text-xs";

/** The installments and payments of the printed settlement, if there are any. */
export const ImpresaMovimientos = component$<{ vigente: Vigente }>(
  ({ vigente }) => {
    const { cuotas, liq } = vigente;

    return (
      <>
        {cuotas.length > 0 && (
          <section>
            <p class={TITULO}>Cuotas</p>
            {cuotas.map(({ cuota, orden, estado: est }) => (
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
        {liq.pagos.length > 0 && (
          <section>
            <p class={TITULO}>Pagos</p>
            {liq.pagos.map((pago) => (
              <div
                key={pago.id}
                class={`${FILA} grid-cols-[6rem_4rem_minmax(0,1fr)_7rem]`}
              >
                <span>{fechaCorta(pago.fecha)}</span>
                <span>{pago.sentido}</span>
                <span class="truncate">
                  {MEDIOS[pago.medio].toLowerCase()}
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
