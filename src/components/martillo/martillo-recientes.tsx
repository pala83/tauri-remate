import { component$ } from "@builder.io/qwik";
import { Tecla } from "~/components/tecla/tecla";
import { Button } from "~/components/ui";
import { titulo } from "~/lib/textos";
import type { MartilloState } from "./use-martillo";

export const MartilloRecientes = component$<{ m: MartilloState }>(({ m }) => {
  if (m.recientes.value.length === 0) return null;
  return (
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-muted-foreground font-mono text-xs tracking-wider uppercase">
        Compradores recientes
      </span>
      {m.recientes.value.map((id, i) => {
        const nombre = titulo(
          m.clientes.value.find((c) => c.id === id)?.nombre ?? "",
        );
        return (
          <Button
            key={id}
            look="outline"
            title={nombre}
            aria-pressed={id === m.compradorId.value}
            class="aria-pressed:bg-foreground aria-pressed:text-background h-9 min-w-0 gap-1.5 pr-2 pl-1 font-sans text-base font-normal shadow-xs aria-pressed:font-bold aria-pressed:[&_kbd]:border-current aria-pressed:[&_kbd]:bg-transparent aria-pressed:[&_kbd]:text-inherit"
            onClick$={() => {
              m.compradorId.value = id;
            }}
          >
            <Tecla>Ctrl {i + 1}</Tecla>
            <span class="truncate">{nombre}</span>
          </Button>
        );
      })}
    </div>
  );
});
