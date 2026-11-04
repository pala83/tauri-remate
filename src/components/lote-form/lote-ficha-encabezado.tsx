import { component$, type QRL } from "@builder.io/qwik";
import { LuX } from "@qwikest/icons/lucide";
import { Button } from "~/components/ui";

type EncabezadoProps = {
  numero: number;
  nombre: string;
  onCerrar$: QRL<() => void>;
};

export const LoteFichaEncabezado = component$<EncabezadoProps>(
  ({ numero, nombre, onCerrar$ }) => {
    return (
      <div class="bg-muted flex shrink-0 items-center gap-3.5 border-b py-2 pr-3 pl-5">
        <div class="bg-card flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-sm border shadow-xs">
          <span class="text-muted-foreground font-mono text-xs tracking-widest">
            N°
          </span>
          <span class="font-serif text-2xl leading-none">{numero}</span>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <p class="text-muted-foreground font-mono text-xs tracking-wider uppercase">
            Completar lote
          </p>
          <h3 class="truncate font-serif text-2xl leading-tight">
            {nombre.trim() || "Sin nombre"}
          </h3>
        </div>
        <Button
          look="ghost"
          size="icon"
          aria-label="Cerrar la ficha"
          onClick$={onCerrar$}
        >
          <LuX class="size-5" />
        </Button>
      </div>
    );
  },
);
