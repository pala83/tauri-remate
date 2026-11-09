import { component$ } from "@builder.io/qwik";
import { fechaLarga } from "~/lib/fechas";
import { pesos, titulo } from "~/lib/textos";
import { ImpresaLineas } from "./impresa-lineas";
import { ImpresaMovimientos } from "./impresa-movimientos";
import { etiquetaSaldo, firmado } from "./saldo";
import type { Vigente } from "./vigente";

export const ID_IMPRESA = "liquidacion-impresa";

/**
 * Never shown on screen: `imprimir` prints a copy of it. Drawn from the
 * settlement read from the database just before printing.
 */
export const LiquidacionImpresa = component$<{ vigente: Vigente | null }>(
  ({ vigente }) => {
    if (!vigente) return null;
    const { liq, remate, cliente } = vigente;

    return (
      <div id={ID_IMPRESA} hidden>
        <article class="flex flex-col gap-4.5">
          <header class="flex items-end justify-between gap-6 border-b-3 border-double pb-3">
            <div class="flex flex-col gap-1">
              <span class="font-mono text-xs tracking-widest uppercase">
                Liquidación · {remate.nombre}
              </span>
              <span class="font-serif text-3xl">{titulo(cliente.nombre)}</span>
              <span class="font-mono text-sm">{fechaLarga(remate.fecha)}</span>
            </div>
            <span class="font-mono text-xs">
              Emitida el {fechaLarga(new Date())}
            </span>
          </header>
          <ImpresaLineas
            titulo="Compras · precio + comisión"
            signo="+"
            lineas={liq.compras}
          />
          <ImpresaLineas
            titulo="Ventas · precio − comisión"
            signo="−"
            lineas={liq.ventas}
          />
          <dl class="ml-auto grid w-85 grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1 font-mono text-sm">
            <dt>Compras</dt>
            <dd class="text-right">{pesos(liq.tCompras)}</dd>
            <dt>Ventas</dt>
            <dd class="text-right">− {pesos(liq.tVentas)}</dd>
            <dt class="font-bold">Neto</dt>
            <dd class="text-right font-bold">{firmado(liq.neto)}</dd>
            <dt>Cobros</dt>
            <dd class="text-right">− {pesos(liq.cobros)}</dd>
            <dt>Pagos al cliente</dt>
            <dd class="text-right">+ {pesos(liq.pagosAl)}</dd>
            <dt class="border-t pt-1 font-bold">{etiquetaSaldo(liq.saldo)}</dt>
            <dd class="border-t pt-1 text-right font-bold">
              {firmado(liq.saldo)}
            </dd>
          </dl>
          <ImpresaMovimientos vigente={vigente} />
          <footer class="border-t pt-2.5 font-mono text-xs">
            Los importes se calculan desde los lotes vendidos; si se corrige un
            lote, la liquidación se recalcula.
          </footer>
        </article>
      </div>
    );
  },
);
