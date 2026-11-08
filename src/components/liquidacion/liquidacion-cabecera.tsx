import { component$ } from "@builder.io/qwik";
import { Sello } from "~/components/sello/sello";
import type { RemateDeCliente } from "~/db/liquidaciones";
import { aInputFecha, fechaLarga } from "~/lib/fechas";
import { pesos } from "~/lib/textos";
import { claseSaldo, etiquetaSaldo } from "./saldo";

type CabeceraProps = {
  remate: RemateDeCliente;
  generada: boolean;
  saldo: number;
  sinComision: boolean;
};

export const LiquidacionCabecera = component$<CabeceraProps>(
  ({ remate, generada, saldo, sinComision }) => {
    return (
      <header class="bg-muted flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b px-7 pt-5.5 pb-4.5">
        <div class="flex min-w-0 flex-col gap-1">
          <p class="text-muted-foreground font-mono text-xs tracking-wider uppercase">
            {generada ? "Liquidación generada" : "Vista previa · sin generar"}
          </p>
          <h3 class="font-serif text-3xl">{remate.nombre}</h3>
          <p class="text-muted-foreground font-mono text-sm">
            <time dateTime={aInputFecha(remate.fecha)}>
              {fechaLarga(remate.fecha)}
            </time>
          </p>
        </div>
        <div class="flex flex-col items-end gap-1 text-right">
          <span class="text-muted-foreground font-mono text-xs tracking-wider uppercase">
            {etiquetaSaldo(saldo)}
          </span>
          <span class={`font-serif text-5xl leading-none ${claseSaldo(saldo)}`}>
            {pesos(saldo)}
          </span>
          {sinComision && <Sello color="acento">Sin comisión</Sello>}
        </div>
      </header>
    );
  },
);
