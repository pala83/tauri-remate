import { component$, Slot, type QRL } from "@builder.io/qwik";
import type { LoteConClientes } from "~/db/lotes";
import { CANTIDAD_COLUMNAS, PlanillaCabecera } from "./planilla-cabecera";
import { PlanillaFila } from "./planilla-fila";
import { PlanillaVacia } from "./planilla-vacia";
import type { PlanillaVirtual } from "./use-planilla-virtual";

type LotesPlanillaProps = {
  filas: LoteConClientes[];
  sinLotes: boolean;
  virtual: PlanillaVirtual;
  seleccionada: number | null;
  reciente: number | null;
  onAbrir$: QRL<(numero: number) => void>;
};

export const LotesPlanilla = component$<LotesPlanillaProps>((props) => {
  const { caja, rango, onScroll } = props.virtual;
  const { desde, hasta, arriba, abajo } = rango.value;

  return (
    <div
      id="planilla-caja"
      class="hoja bg-card relative mr-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm border shadow-2xl max-md:h-140 max-md:flex-none"
    >
      <div
        id="planilla"
        ref={caja}
        onScroll$={onScroll}
        class="scroll-fino min-h-0 flex-1 overflow-auto"
      >
        <table class="w-full min-w-200 table-fixed border-separate border-spacing-0">
          <PlanillaCabecera />
          <tbody>
            {/* The only heights computed at runtime: the rows left out of the DOM. */}
            <tr aria-hidden="true" style={{ height: `${arriba}px` }}>
              <td colSpan={CANTIDAD_COLUMNAS} class="p-0" />
            </tr>
            {props.filas.slice(desde, hasta).map((lote) => (
              <PlanillaFila
                key={lote.numero}
                lote={lote}
                seleccionada={props.seleccionada === lote.numero}
                reciente={props.reciente === lote.numero}
                onAbrir$={props.onAbrir$}
              />
            ))}
            <tr aria-hidden="true" style={{ height: `${abajo}px` }}>
              <td colSpan={CANTIDAD_COLUMNAS} class="p-0" />
            </tr>
          </tbody>
        </table>
        {props.filas.length === 0 && (
          <PlanillaVacia sinLotes={props.sinLotes} />
        )}
      </div>
      <Slot />
    </div>
  );
});
