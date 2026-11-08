import { component$, type QRL } from "@builder.io/qwik";
import { Sello } from "~/components/sello/sello";
import type { LoteConClientes } from "~/db/lotes";
import { pesos, titulo } from "~/lib/textos";

type FilaProps = {
  lote: LoteConClientes;
  hijos: number;
  seleccionada: boolean;
  reciente: boolean;
  onAbrir$: QRL<(numero: number) => void>;
};

const TENUE = "text-muted-foreground";

export const MartilloFila = component$<FilaProps>(
  ({ lote, hijos, seleccionada, reciente, onAbrir$ }) => {
    const celda = [
      "h-9 truncate px-2.5 border-r-1 border-sidebar-border last:border-r-0",
      lote.numero % 10 === 0
        ? "border-b border-b-muted-foreground"
        : "border-b-1",
    ];
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
        <td class={[celda, "p-0 text-right font-serif text-xl"]}>
          <button
            type="button"
            aria-label={`Lote ${lote.numero}: ${lote.nombre}. Llevar al martillo`}
            class="focus-visible:outline-ring h-full w-full cursor-pointer pr-3 text-right focus-visible:outline-2 focus-visible:-outline-offset-2"
          >
            {lote.numero}
          </button>
        </td>
        <td class={celda} title={lote.nombre}>
          {lote.nombre}
        </td>
        <td class={celda}>{titulo(lote.duenoNombre)}</td>
        <td class={[mono, lote.precioBase === null && TENUE]}>
          {lote.precioBase === null ? "—" : pesos(lote.precioBase)}
        </td>
        <td class={[mono, lote.compradorId === null && TENUE]}>
          {lote.vendidoCon !== null ? (
            <span class={TENUE}>con N° {lote.vendidoCon}</span>
          ) : lote.precioVenta !== null ? (
            <>
              <strong>{pesos(lote.precioVenta)}</strong>
              {hijos > 0 && (
                <span class="ml-1.5">
                  <Sello mini color="tenue">
                    +{hijos}
                  </Sello>
                </span>
              )}
            </>
          ) : (
            "—"
          )}
        </td>
        <td class={[celda, lote.compradorId === null && TENUE]}>
          {lote.compradorNombre ? titulo(lote.compradorNombre) : "—"}
        </td>
      </tr>
    );
  },
);
