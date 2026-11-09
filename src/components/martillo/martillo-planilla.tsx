import { component$ } from "@builder.io/qwik";
import { hijosDe } from "~/lib/martillo";
import { MartilloFila } from "./martillo-fila";
import type { MartilloState } from "./use-martillo";
import { enfocarLote } from "./use-martillo-escritura";

const COLUMNAS = [
  { titulo: "N°", ancho: "w-15", clase: "text-right" },
  { titulo: "Artículo", ancho: "" },
  { titulo: "Dueño", ancho: "w-1/6" },
  { titulo: "Base", ancho: "w-28", clase: "text-right" },
  { titulo: "Precio", ancho: "w-36", clase: "text-right" },
  { titulo: "Comprador", ancho: "w-1/6" },
];

export const MartilloPlanilla = component$<{ m: MartilloState }>(({ m }) => {
  const { caja, rango, onScroll } = m.virtual;

  return (
    <div
      id="planilla-caja"
      class="hoja bg-card relative mr-2 flex min-h-50 flex-1 flex-col overflow-hidden rounded-sm border shadow-2xl max-md:h-140 max-md:flex-none"
    >
      <div
        ref={caja}
        onScroll$={onScroll}
        class="scroll-fino min-h-0 flex-1 overflow-auto"
      >
        <table class="w-full min-w-195 table-fixed border-separate border-spacing-0">
          <colgroup>
            {COLUMNAS.map(({ titulo, ancho }) => (
              <col key={titulo} class={ancho} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {COLUMNAS.map(({ titulo, clase }) => (
                <th
                  key={titulo}
                  scope="col"
                  class={[
                    "bg-muted text-muted-foreground border-r-sidebar-border border-b-foreground sticky top-0 z-2 h-9 truncate border-r-1 border-b-3 border-double px-2.5 text-left font-mono text-xs font-normal tracking-wider uppercase last:border-r-0",
                    clase,
                  ]}
                >
                  {titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* The only heights computed at runtime: the rows left out of the DOM. */}
            <tr
              aria-hidden="true"
              style={{ height: `${rango.value.arriba}px` }}
            >
              <td colSpan={COLUMNAS.length} class="p-0" />
            </tr>
            {m.filas.value
              .slice(rango.value.desde, rango.value.hasta)
              .map((lote) => (
                <MartilloFila
                  key={lote.numero}
                  lote={lote}
                  hijos={hijosDe(m.lotes.value, lote.numero).length}
                  seleccionada={m.numero.value === lote.numero}
                  reciente={m.recien.value === lote.numero}
                  onAbrir$={async (n) => {
                    m.mensaje.value = undefined;
                    await m.cargarLote(n);
                    enfocarLote();
                  }}
                />
              ))}
            <tr aria-hidden="true" style={{ height: `${rango.value.abajo}px` }}>
              <td colSpan={COLUMNAS.length} class="p-0" />
            </tr>
          </tbody>
        </table>
        {m.datos.value && m.filas.value.length === 0 && (
          <p class="text-muted-foreground p-7 text-lg italic">
            Ningún lote en este filtro.
          </p>
        )}
      </div>
    </div>
  );
});
