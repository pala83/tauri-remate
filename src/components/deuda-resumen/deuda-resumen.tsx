import { component$ } from "@builder.io/qwik";
import { Card } from "~/components/ui";
import { pesos } from "~/lib/textos";

export type Deuda = {
  deben: number;
  nDeben: number;
  aPagar: number;
  nAPagar: number;
  cobrado: number;
  pagado: number;
};

const clientes = (n: number) => (n === 1 ? "1 cliente" : `${n} clientes`);
const TITULO =
  "text-muted-foreground font-mono text-xs tracking-wider uppercase";
const NOTA = "text-muted-foreground font-mono text-sm";
const CELDA = "flex flex-col gap-0.5 px-5.5 py-3.5";

export const DeudaResumen = component$<{ remate: string; deuda: Deuda }>(
  ({ remate, deuda }) => {
    return (
      <section aria-label="Deuda pendiente" class="mb-6">
        <div class="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
          <h2 class="font-mono text-sm font-bold tracking-wider uppercase">
            Deuda pendiente · {remate}
          </h2>
          <span class={NOTA}>se calcula siempre desde los lotes vendidos</span>
        </div>
        <Card.Root class="shadow-md">
          <dl class="divide-sidebar-border grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div class={CELDA}>
              <dt class={TITULO}>Deben a la casa</dt>
              <dd class="text-alert font-serif text-3xl">
                {pesos(deuda.deben)}
              </dd>
              <dd class={NOTA}>{clientes(deuda.nDeben)}</dd>
            </div>
            <div class={CELDA}>
              <dt class={TITULO}>A pagar a dueños</dt>
              <dd class="text-sidebar-accent font-serif text-3xl">
                {pesos(deuda.aPagar)}
              </dd>
              <dd class={NOTA}>{clientes(deuda.nAPagar)}</dd>
            </div>
            <div class={CELDA}>
              <dt class={TITULO}>Cobrado</dt>
              <dd class="font-serif text-3xl">{pesos(deuda.cobrado)}</dd>
              <dd class={NOTA}>pagado a dueños {pesos(deuda.pagado)}</dd>
            </div>
          </dl>
        </Card.Root>
      </section>
    );
  },
);
