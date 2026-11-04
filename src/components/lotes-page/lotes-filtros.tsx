import { $, component$, useSignal } from "@builder.io/qwik";
import { LuSearch } from "@qwikest/icons/lucide";
import { Input, Label, ToggleGroup } from "~/components/ui";
import type { LotesPageState } from "./use-lotes-page";

const ITEM =
  "hover:bg-muted aria-pressed:hover:bg-foreground not-last:border-input gap-2 rounded-none border-0 font-mono not-last:border-r";

export const LotesFiltros = component$<{ page: LotesPageState }>(({ page }) => {
  const numero = useSignal("");
  const error = useSignal("");
  const resumen = page.resumen.value;

  const elegirFiltro = $((valor: string) => {
    // Pressing the active filter deselects it: back to all of them.
    if (!valor) page.filtro.value = "todos";
  });

  return (
    <div class="mr-2 flex shrink-0 flex-wrap items-center gap-x-3.5 gap-y-2">
      <div class="relative min-w-60 flex-1">
        <LuSearch class="text-muted-foreground pointer-events-none absolute top-3.5 left-3.5 size-4.5" />
        <Input
          id="buscar-lote"
          type="search"
          autocomplete="off"
          aria-label="Buscar en la planilla"
          class="pl-11"
          placeholder="Buscar artículo, dueño, marca o material"
          bind:value={page.busqueda}
        />
      </div>
      <div class="flex items-center gap-2">
        <Label
          for="ir-numero"
          class="font-mono text-sm font-bold whitespace-nowrap"
        >
          Ir al N°
        </Label>
        <Input
          id="ir-numero"
          type="number"
          min="1"
          class="w-23 font-mono"
          placeholder="—"
          bind:value={numero}
          onInput$={() => (error.value = "")}
          onKeyDown$={(e, el) => {
            if (e.key !== "Enter") return;
            const n = Number(el.value);
            if (!page.lotes.value.some((lote) => lote.numero === n)) {
              error.value = el.value
                ? `No existe el N° ${n}.`
                : "Escribí un número.";
              return;
            }
            numero.value = "";
            return page.irA(n);
          }}
        />
        {error.value && (
          <span role="alert" class="text-alert font-mono text-xs">
            {error.value}
          </span>
        )}
      </div>
      <ToggleGroup.Root
        bind:value={page.filtro}
        onChange$={elegirFiltro}
        class="bg-popover w-fit gap-0 overflow-hidden rounded-sm border shadow-xs"
      >
        <ToggleGroup.Item value="todos" size="lg" class={ITEM}>
          Todos <span>{resumen.total}</span>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="sin-detalles" size="lg" class={ITEM}>
          Sin detalles <span>{resumen.sinDetalles}</span>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="sin-foto" size="lg" class={ITEM}>
          Sin foto <span>{resumen.sinFoto}</span>
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );
});
