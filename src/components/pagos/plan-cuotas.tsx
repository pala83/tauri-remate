import { component$, useComputed$, useSignal } from "@builder.io/qwik";
import type { LiquidacionState } from "~/components/liquidacion/use-liquidacion";
import {
  FormMessage,
  type Mensaje,
} from "~/components/page-columns/form-message";
import { Button, Card } from "~/components/ui";
import { fechaCorta } from "~/lib/fechas";
import { pesos } from "~/lib/textos";
import { cuotasDe } from "./cuotas-de";
import { PlanForm } from "./plan-form";

const CLASE_ESTADO = {
  pagada: "text-sidebar-accent",
  vencida: "text-alert",
  parcial: "text-muted-foreground",
  pendiente: "text-muted-foreground",
};

export const PlanCuotas = component$<{ estado: LiquidacionState }>(
  ({ estado }) => {
    const abierto = useSignal(false);
    const mensaje = useSignal<Mensaje>();
    const cuotas = useComputed$(() => cuotasDe(estado));

    return (
      <Card.Root class="overflow-hidden shadow-lg" aria-label="Plan de cuotas">
        <header class="bg-muted flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-b px-6 py-3.5">
          <h3 class="font-serif text-2xl">Plan de cuotas</h3>
          {!abierto.value && (
            <Button
              look="outline"
              class="shadow-xs"
              onClick$={() => {
                abierto.value = true;
                mensaje.value = undefined;
              }}
            >
              + Armar plan
            </Button>
          )}
        </header>
        {abierto.value && (
          <PlanForm estado={estado} abierto={abierto} mensaje={mensaje} />
        )}
        {cuotas.value.length > 0 && (
          <div class="overflow-x-auto">
            <table class="w-full min-w-165 border-collapse">
              <tbody>
                {cuotas.value.map(({ cuota, orden, pagado, estado: est }) => (
                  <tr
                    key={cuota.id}
                    class="border-sidebar-border h-12 border-b"
                  >
                    <td class="pl-6 font-mono font-bold">Cuota {orden}</td>
                    <td class="text-muted-foreground font-mono text-sm">
                      {cuota.plazoDias} días
                    </td>
                    <td class="font-mono text-sm">
                      vence {fechaCorta(cuota.vence)}
                    </td>
                    <td>
                      {cuota.loteNumero
                        ? `N° ${cuota.loteNumero}`
                        : "toda la cuenta"}
                    </td>
                    <td class="text-right font-mono font-bold">
                      {pesos(cuota.monto)}
                    </td>
                    <td
                      class={`pr-6 text-right font-mono text-xs ${CLASE_ESTADO[est]}`}
                    >
                      {est}
                      {pagado > 0 && pagado < cuota.monto
                        ? ` · pagó ${pesos(pagado)}`
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {cuotas.value.length === 0 && !abierto.value && (
          <p class="text-muted-foreground px-6 py-4.5 italic">
            Sin plan de cuotas: el saldo se puede pagar en una o varias veces.
          </p>
        )}
        {!abierto.value && mensaje.value && (
          <div class="px-6 py-3">
            <FormMessage mensaje={mensaje.value} />
          </div>
        )}
      </Card.Root>
    );
  },
);
