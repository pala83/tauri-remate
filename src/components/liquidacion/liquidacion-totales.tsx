import { component$ } from "@builder.io/qwik";
import type { Liquidado } from "~/lib/liquidacion";
import { pesos } from "~/lib/textos";
import { claseSaldo } from "./saldo";

const firmado = (n: number) => `${n < 0 ? "− " : ""}${pesos(n)}`;
const TENUE = "text-muted-foreground";

export const LiquidacionTotales = component$<{ liq: Liquidado }>(({ liq }) => {
  return (
    <dl class="bg-popover grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1.5 rounded-sm border px-5 py-4 font-mono">
      <dt class={TENUE}>Compras con comisión</dt>
      <dd class="text-right">{pesos(liq.tCompras)}</dd>
      <dt class={TENUE}>Ventas, menos comisión</dt>
      <dd class="text-right">− {pesos(liq.tVentas)}</dd>
      <dt class="border-sidebar-border border-t pt-1.5 font-bold">Neto</dt>
      <dd class="border-sidebar-border border-t pt-1.5 text-right font-bold">
        {firmado(liq.neto)}
      </dd>
      <dt class={TENUE}>Cobros recibidos</dt>
      <dd class="text-right">− {pesos(liq.cobros)}</dd>
      <dt class={TENUE}>Pagos al cliente</dt>
      <dd class="text-right">+ {pesos(liq.pagosAl)}</dd>
      <dt class="border-t pt-2 text-lg font-bold">Saldo</dt>
      <dd
        class={`border-t pt-2 text-right text-lg font-bold ${claseSaldo(liq.saldo)}`}
      >
        {firmado(liq.saldo)}
      </dd>
    </dl>
  );
});
