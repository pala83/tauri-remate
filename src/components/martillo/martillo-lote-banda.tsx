import { component$ } from "@builder.io/qwik";
import { Sello } from "~/components/sello/sello";
import type { LoteConClientes } from "~/db/lotes";
import { pesos, titulo } from "~/lib/textos";

const detalle = (l: LoteConClientes) =>
  [
    `Dueño: ${titulo(l.duenoNombre)}`,
    l.marca,
    l.materiales,
    l.funciona === null ? null : l.funciona ? "funciona" : "no funciona",
    l.cantidad ? `cantidad ${l.cantidad}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

export const MartilloLoteBanda = component$<{ lote: LoteConClientes }>(
  ({ lote }) => {
    return (
      <div class="bg-muted flex flex-wrap items-center gap-x-5 gap-y-3 rounded-t-sm border-b py-3 pr-4.5 pl-5">
        <div class="bg-primary text-primary-foreground flex h-20 w-23 shrink-0 flex-col items-center justify-center rounded-sm border shadow-xs">
          <span class="font-mono text-xs tracking-widest">LOTE N°</span>
          <span class="font-serif text-5xl leading-none">{lote.numero}</span>
        </div>
        <div class="flex min-w-60 flex-1 flex-col gap-1">
          <div class="flex items-center gap-2.5">
            <span class="text-muted-foreground font-mono text-xs tracking-wider uppercase">
              En el martillo
            </span>
            <Sello color={lote.compradorId === null ? "tenue" : "azul"}>
              {lote.compradorId === null ? "Sin vender" : "Vendido"}
            </Sello>
          </div>
          <h2 class="font-serif text-3xl leading-tight">{lote.nombre}</h2>
          <p class="text-muted-foreground font-mono text-sm">{detalle(lote)}</p>
        </div>
        <div class="flex flex-col items-end gap-0.5">
          <span class="text-muted-foreground font-mono text-xs tracking-wider uppercase">
            Base
          </span>
          <span class="font-serif text-2xl leading-none">
            {lote.precioBase === null ? "—" : pesos(lote.precioBase)}
          </span>
        </div>
      </div>
    );
  },
);
