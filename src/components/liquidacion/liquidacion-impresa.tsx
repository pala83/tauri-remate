import { component$ } from "@builder.io/qwik";
import { fechaLarga } from "~/lib/fechas";
import { pesos, titulo } from "~/lib/textos";
import { ImpresaLineas } from "./impresa-lineas";
import { ImpresaMovimientos } from "./impresa-movimientos";
import { etiquetaSaldo } from "./saldo";
import type { LiquidacionState } from "./use-liquidacion";

export const ID_IMPRESA = "liquidacion-impresa";

/** Never shown on screen: `imprimir` prints a copy of it. */
export const LiquidacionImpresa = component$<{
  estado: LiquidacionState;
  nombre: string;
}>(({ estado, nombre }) => {
  const { liq, remate } = estado;
  if (!liq.value || !remate.value) return null;

  return (
    <div id={ID_IMPRESA} hidden>
      <article class="flex flex-col gap-4.5">
        <header class="flex items-end justify-between gap-6 border-b-3 border-double pb-3">
          <div class="flex flex-col gap-1">
            <span class="font-mono text-xs tracking-widest uppercase">
              Liquidación · {remate.value.nombre}
            </span>
            <span class="font-serif text-3xl">{titulo(nombre)}</span>
            <span class="font-mono text-sm">
              {fechaLarga(remate.value.fecha)}
            </span>
          </div>
          <span class="font-mono text-xs">
            Emitida el {fechaLarga(new Date())}
          </span>
        </header>
        <ImpresaLineas
          titulo="Compras · precio + comisión"
          signo="+"
          lineas={liq.value.compras}
        />
        <ImpresaLineas
          titulo="Ventas · precio − comisión"
          signo="−"
          lineas={liq.value.ventas}
        />
        <dl class="ml-auto grid w-85 grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1 font-mono text-sm">
          <dt>Compras</dt>
          <dd class="text-right">{pesos(liq.value.tCompras)}</dd>
          <dt>Ventas</dt>
          <dd class="text-right">− {pesos(liq.value.tVentas)}</dd>
          <dt class="font-bold">Neto</dt>
          <dd class="text-right font-bold">
            {liq.value.neto < 0 ? "− " : ""}
            {pesos(liq.value.neto)}
          </dd>
          <dt>Cobros</dt>
          <dd class="text-right">− {pesos(liq.value.cobros)}</dd>
          <dt>Pagos al cliente</dt>
          <dd class="text-right">+ {pesos(liq.value.pagosAl)}</dd>
          <dt class="border-t pt-1 font-bold">
            {etiquetaSaldo(liq.value.saldo)}
          </dt>
          <dd class="border-t pt-1 text-right font-bold">
            {pesos(liq.value.saldo)}
          </dd>
        </dl>
        <ImpresaMovimientos estado={estado} />
        <footer class="border-t pt-2.5 font-mono text-xs">
          Los importes se calculan desde los lotes vendidos; si se corrige un
          lote, la liquidación se recalcula.
        </footer>
      </article>
    </div>
  );
});
