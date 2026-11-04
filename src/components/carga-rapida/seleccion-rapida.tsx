import { component$, type QRL } from "@builder.io/qwik";
import { Tecla } from "~/components/tecla/tecla";
import { Button } from "~/components/ui";

type SeleccionRapidaProps = {
  recientes: { id: number; nombre: string }[];
  duenoId: number | null;
  onElegir$: QRL<(id: number) => void>;
};

export const SeleccionRapida = component$<SeleccionRapidaProps>(
  ({ recientes, duenoId, onElegir$ }) => {
    if (recientes.length === 0) {
      return (
        <p class="text-muted-foreground italic">
          Acá van a aparecer los últimos cinco dueños a los que les cargues un
          lote.
        </p>
      );
    }
    return (
      <div class="flex min-w-0 gap-2">
        {recientes.map(({ id, nombre }, i) => (
          <Button
            key={id}
            look="outline"
            title={nombre}
            aria-pressed={id === duenoId}
            class="aria-pressed:bg-foreground aria-pressed:text-background h-9 min-w-0 gap-1.5 pr-2 pl-1 font-sans text-base font-normal shadow-xs aria-pressed:font-bold aria-pressed:[&_kbd]:border-current aria-pressed:[&_kbd]:bg-transparent aria-pressed:[&_kbd]:text-inherit"
            onClick$={() => onElegir$(id)}
          >
            <Tecla>Ctrl {i + 1}</Tecla>
            <span class="min-w-0 truncate">{nombre}</span>
          </Button>
        ))}
      </div>
    );
  },
);
