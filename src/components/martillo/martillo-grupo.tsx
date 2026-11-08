import { component$, useSignal } from "@builder.io/qwik";
import { LuX } from "@qwikest/icons/lucide";
import { Button, Input, Label } from "~/components/ui";
import type { MartilloState } from "./use-martillo";
import type { MartilloAcciones } from "./use-martillo-acciones";

type GrupoProps = { m: MartilloState; acciones: MartilloAcciones };

/** The lots that go with the one in the hammer, for a single price. */
export const MartilloGrupo = component$<GrupoProps>(({ m, acciones }) => {
  const numero = useSignal("");
  const error = useSignal<string>();

  return (
    <div class="flex flex-wrap items-center gap-x-2.5 gap-y-2">
      <span class="font-mono text-xs tracking-wider uppercase">
        Se vende junto con
      </span>
      {m.grupo.value.map((n) => (
        <span
          key={n}
          class="bg-popover flex items-center gap-1.5 rounded-sm border py-0.5 pr-0.5 pl-2 font-mono text-sm"
        >
          <strong>N° {n}</strong>
          <span class="max-w-40 truncate font-sans">
            {m.lotes.value.find((l) => l.numero === n)?.nombre}
          </span>
          <Button
            look="ghost"
            size="icon"
            aria-label={`Quitar el N° ${n} del conjunto`}
            class="h-6 w-6"
            onClick$={() => {
              m.grupo.value = m.grupo.value.filter((x) => x !== n);
            }}
          >
            <LuX class="size-3.5" />
          </Button>
        </span>
      ))}
      {m.grupo.value.length === 0 && (
        <span class="text-muted-foreground italic">solo este lote</span>
      )}
      <Button
        look="link"
        class="text-sidebar-primary h-auto px-1 font-mono text-sm font-normal underline"
        onClick$={acciones.agregarSiguiente}
      >
        + siguiente
      </Button>
      <span class="ml-auto flex items-center gap-2">
        {error.value && (
          <span role="alert" class="text-alert font-mono text-xs">
            {error.value}
          </span>
        )}
        <Label for="r-agrupar" class="font-mono text-xs font-bold">
          Agregar N°
        </Label>
        <Input
          id="r-agrupar"
          type="number"
          min="1"
          class="h-9 w-20 font-mono"
          bind:value={numero}
          onInput$={() => (error.value = undefined)}
          onKeyDown$={async (e) => {
            if (e.key !== "Enter" || !numero.value) return;
            error.value = await acciones.agregarAlGrupo(Number(numero.value));
            if (!error.value) numero.value = "";
          }}
        />
      </span>
    </div>
  );
});
