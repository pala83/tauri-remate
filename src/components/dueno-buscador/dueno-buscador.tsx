import { component$, type QRL } from "@builder.io/qwik";
import { LuCheck, LuPlus, LuSearch } from "@qwikest/icons/lucide";
import { cn } from "@qwik-ui/utils";
import { Combobox, Input } from "~/components/ui";
import type { ClienteResumen } from "~/db/clientes";
import { evitarPorDefecto, seleccionarTexto } from "./eventos-buscador";
import { useDuenoBuscador } from "./use-dueno-buscador";

export type DuenoBuscadorProps = {
  id: string;
  clientes: ClienteResumen[];
  recientes: number[];
  cuentas: Record<number, number>;
  duenoId: number | null;
  /** Floats the list above the field; otherwise a scrolling panel clips it. */
  arriba?: boolean;
  onElegir$: QRL<(id: number, conEnter: boolean) => void>;
  onNuevo$: QRL<(nombre: string) => Promise<number>>;
  onEnter$?: QRL<() => void>; // Enter with the list closed
};

export const DuenoBuscador = component$<DuenoBuscadorProps>((props) => {
  const b = useDuenoBuscador(props);
  const lista = b.lista.value;
  const listaId = `${props.id}-opciones`;

  return (
    <Combobox.Root
      mode="inline"
      filter={false}
      bind:value={b.seleccion}
      onChange$={b.alCambiar}
      class="relative"
    >
      <Combobox.Control>
        <LuSearch class="text-muted-foreground pointer-events-none absolute left-3.5 size-4.5" />
        <Input
          id={props.id}
          role="combobox"
          autocomplete="off"
          aria-autocomplete="list"
          aria-expanded={lista.length > 0}
          aria-controls={listaId}
          aria-activedescendant={
            lista.length ? `${listaId}-${b.indice.value}` : ""
          }
          placeholder="Buscar cliente…"
          class="pr-10 pl-10.5"
          bind:value={b.texto}
          // A click would undo the selection made on focus.
          preventdefault:mouseup
          onKeyDown$={[evitarPorDefecto, b.teclas]}
          onInput$={(_, el) => b.escribir(el.value)}
          onFocus$={seleccionarTexto}
          onBlur$={b.cerrar}
        />
        {!b.editando.value && props.duenoId !== null && (
          <LuCheck class="text-sidebar-accent pointer-events-none absolute right-3.5 size-4.5" />
        )}
      </Combobox.Control>
      {lista.length > 0 && (
        <Combobox.Inline
          id={listaId}
          preventdefault:mousedown
          aria-label="Clientes"
          class={cn(
            "bg-card rounded-sm border p-1.5 shadow-xs",
            props.arriba
              ? "absolute inset-x-0 bottom-full z-30 mb-2 max-h-96 overflow-y-auto shadow-2xl"
              : "mt-2",
          )}
        >
          {lista.map((opcion, i) => (
            <Combobox.Item
              key={opcion.clave}
              id={`${listaId}-${i}`}
              value={opcion.clave}
              class={cn(
                i === b.indice.value &&
                  "bg-muted outline-border outline-2 -outline-offset-2",
                opcion.id === null &&
                  "text-sidebar-primary font-mono text-sm font-bold",
              )}
            >
              {opcion.id === null && <LuPlus class="size-4 shrink-0" />}
              <Combobox.ItemLabel class="min-w-0 flex-1 truncate">
                {opcion.texto}
              </Combobox.ItemLabel>
              <span class="text-muted-foreground shrink-0 font-mono text-xs font-normal">
                {opcion.info}
              </span>
            </Combobox.Item>
          ))}
        </Combobox.Inline>
      )}
    </Combobox.Root>
  );
});
