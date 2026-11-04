import { component$ } from "@builder.io/qwik";
import { DottedRow } from "~/components/page-columns/dotted-row";
import { lotesTxt } from "~/lib/textos";

type Item = {
  remateId: number;
  numero: number;
  nombre: string;
  remateNombre: string;
};

type HistorialListaProps = { titulo: string; vacio: string; items: Item[] };

export const HistorialLista = component$<HistorialListaProps>(
  ({ titulo, vacio, items }) => {
    return (
      <div class="flex flex-col gap-2">
        <p class="text-sidebar-accent-foreground text-xs tracking-widest uppercase">
          {titulo} · {lotesTxt(items.length)}
        </p>
        <dl class="flex flex-col gap-1">
          {items.map((item) => (
            <DottedRow
              key={`${item.remateId}-${item.numero}`}
              numero={item.numero}
              label={item.nombre}
              value={item.remateNombre}
              tenue
            />
          ))}
        </dl>
        {items.length === 0 && (
          <p class="text-sidebar-accent-foreground italic">{vacio}</p>
        )}
      </div>
    );
  },
);
