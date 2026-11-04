import { component$ } from "@builder.io/qwik";
import { Tecla } from "~/components/tecla/tecla";

type LotesResumenProps = {
  total: number;
  duenos: number;
  sinDetalles: number;
};

const ATAJOS = [
  { teclas: ["Enter"], texto: "carga el lote" },
  { teclas: ["Ctrl 1–5"], texto: "dueño reciente" },
  { teclas: ["↑", "↓"], texto: "recorre el buscador" },
  { teclas: ["Esc"], texto: "cierra el buscador o la ficha" },
];

export const LotesResumen = component$<LotesResumenProps>(
  ({ total, duenos, sinDetalles }) => {
    return (
      <div class="font-mono text-sm">
        <section class="mt-9">
          <h2 class="mb-3 font-bold">Jornada de carga</h2>
          <dl class="flex flex-col gap-2">
            <div class="flex justify-between gap-3">
              <dt class="text-muted-foreground">Lotes</dt>
              <dd class="font-bold">{total}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted-foreground">Dueños</dt>
              <dd class="font-bold">{duenos}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted-foreground">Sin detalles</dt>
              <dd class="text-sidebar-primary font-bold">{sinDetalles}</dd>
            </div>
          </dl>
        </section>
        <section class="mt-8">
          <h2 class="mb-3 font-bold">Atajos</h2>
          <dl class="flex flex-col gap-2.5">
            {ATAJOS.map(({ teclas, texto }) => (
              <div key={texto} class="flex items-baseline gap-2.5">
                <dt class="flex shrink-0 gap-1">
                  {teclas.map((tecla) => (
                    <Tecla key={tecla}>{tecla}</Tecla>
                  ))}
                </dt>
                <dd class="text-muted-foreground">{texto}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    );
  },
);
