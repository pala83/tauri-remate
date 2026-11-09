import { component$, type QRL } from "@builder.io/qwik";
import { Sello } from "~/components/sello/sello";
import type { LoteConClientes } from "~/db/lotes";
import { pesos, titulo } from "~/lib/textos";

type PlanillaFilaProps = {
  lote: LoteConClientes;
  seleccionada: boolean;
  reciente: boolean;
  onAbrir$: QRL<(numero: number) => void>;
};

const TENUE = "text-muted-foreground";

export const PlanillaFila = component$<PlanillaFilaProps>(
  ({ lote, seleccionada, reciente, onAbrir$ }) => {
    // Every tenth row has a stronger line, to help counting on the sheet.
    const base = [
      "h-9 truncate px-2.5 border-sidebar-border",
      lote.numero % 10 === 0
        ? "border-b border-b-muted-foreground"
        : "border-b-1",
    ];
    const celda = [base, "border-r-1 last:border-r-0"];
    const mono = [celda, "text-right font-mono text-sm"];

    return (
      <tr
        data-lote={lote.numero}
        class={[
          "hover:bg-muted cursor-pointer",
          seleccionada && "bg-accent hover:bg-accent font-bold",
          reciente && "motion-safe:tinta-fresca",
        ]}
        onClick$={() => onAbrir$(lote.numero)}
      >
        <td
          class={[
            base,
            "border-r-sidebar-primary border-r-2 border-double text-right font-serif text-xl",
          ]}
        >
          <button
            type="button"
            aria-label={`Lote ${lote.numero}: ${lote.nombre}, de ${titulo(lote.duenoNombre)}. Abrir para completar datos`}
            class="focus-visible:outline-ring h-full w-full cursor-pointer pr-3 text-right focus-visible:outline-2 focus-visible:-outline-offset-2"
          >
            {lote.numero}
          </button>
        </td>
        <td class={celda}>{lote.nombre}</td>
        <td class={celda}>{titulo(lote.duenoNombre)}</td>
        <td class={[mono, lote.precioBase === null && TENUE]}>
          {lote.precioBase === null ? "—" : pesos(lote.precioBase)}
        </td>
        <td class={celda}>
          {lote.funciona === null ? (
            <span class={TENUE}>—</span>
          ) : (
            <Sello mini color={lote.funciona ? "azul" : "rojo"}>
              {lote.funciona ? "sí" : "no"}
            </Sello>
          )}
        </td>
        <td class={[celda, !lote.marca && TENUE]}>{lote.marca || "—"}</td>
      </tr>
    );
  },
);
