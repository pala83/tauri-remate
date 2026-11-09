import { component$, type QRL } from "@builder.io/qwik";
import { Sello } from "~/components/sello/sello";
import { Button } from "~/components/ui";
import type { Pago } from "~/db/schema";
import { fechaCorta } from "~/lib/fechas";
import { pesos } from "~/lib/textos";
import { MEDIOS } from "./medios";

const TACHADO = "text-muted-foreground line-through";

type PagoFilaProps = {
  pago: Pago;
  detalle: string;
  onAnular$: QRL<(id: number) => void>;
};

export const PagoFila = component$<PagoFilaProps>(
  ({ pago, detalle, onAnular$ }) => {
    return (
      <li class="border-sidebar-border grid min-h-14 min-w-170 grid-cols-[7rem_5rem_minmax(0,1fr)_7.5rem_6.25rem] items-center gap-x-3.5 border-b px-6 py-1.5">
        <span class="font-mono text-sm">{fechaCorta(pago.fecha)}</span>
        <span>
          <Sello mini color={pago.sentido === "cobro" ? "azul" : "acento"}>
            {pago.sentido}
          </Sello>
        </span>
        <span class="flex min-w-0 flex-col">
          <span class={["truncate", pago.anulado && TACHADO]}>
            {MEDIOS[pago.medio]}
            {pago.referencia ? ` · ${pago.referencia}` : ""}
          </span>
          <span class="text-muted-foreground font-mono text-xs">{detalle}</span>
        </span>
        <span
          class={["text-right font-mono font-bold", pago.anulado && TACHADO]}
        >
          {pesos(pago.monto)}
        </span>
        <span class="flex justify-end">
          {pago.anulado ? (
            <Sello mini color="rojo">
              anulado
            </Sello>
          ) : (
            <Button
              look="link"
              aria-label={`Anular el pago del ${fechaCorta(pago.fecha)}`}
              class="text-sidebar-primary h-auto px-0.5 font-mono text-sm font-normal underline"
              onClick$={() => onAnular$(pago.id)}
            >
              Anular
            </Button>
          )}
        </span>
      </li>
    );
  },
);
