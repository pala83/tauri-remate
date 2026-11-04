import { component$ } from "@builder.io/qwik";
import { lotesTxt } from "~/lib/textos";

type LotesEncabezadoProps = {
  remate: string;
  total: number;
  visibles: number;
};

export const LotesEncabezado = component$<LotesEncabezadoProps>(
  ({ remate, total, visibles }) => {
    const conteo =
      visibles === total
        ? lotesTxt(total)
        : `${visibles} de ${lotesTxt(total)}`;

    return (
      <header class="flex shrink-0 flex-col gap-0.5">
        <p class="text-sidebar-primary font-mono text-xs tracking-widest uppercase">
          {remate}
        </p>
        <div class="flex flex-wrap items-baseline gap-x-4">
          <h1 class="font-serif text-5xl leading-none tracking-tight">Lotes</h1>
          <span class="text-muted-foreground font-mono text-sm">
            {conteo} · tocá una fila para completar sus datos
          </span>
        </div>
      </header>
    );
  },
);
