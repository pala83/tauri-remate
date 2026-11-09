import { component$ } from "@builder.io/qwik";
import { LuCheck, LuPlus, LuSearch } from "@qwikest/icons/lucide";
import { cn } from "@qwik-ui/utils";
import { Combobox, Input } from "~/components/ui";
import { posicion, type DuenoBuscadorProps } from "./dueno-buscador-props";
import { evitarPorDefecto, seleccionarTexto } from "./eventos-buscador";
import { useDuenoBuscador } from "./use-dueno-buscador";

/**
 * The list is Qwik UI's combobox, which handles the mouse. The field is a plain
 * Input because Combobox.Input adds its own key handlers to any we pass: Enter
 * would choose twice, and it clears the highlight when typing.
 */
export const DuenoBuscador = component$<DuenoBuscadorProps>((props) => {
  const b = useDuenoBuscador(props);
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
          aria-expanded={b.lista.value.length > 0}
          aria-controls={listaId}
          aria-activedescendant={
            b.lista.value.length ? `${listaId}-${b.indice.value}` : ""
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
      {b.error.value && (
        <p role="alert" class="text-alert mt-1.5 text-sm">
          No se pudo crear el cliente: {b.error.value}
        </p>
      )}
      {b.lista.value.length > 0 && (
        <Combobox.Inline
          id={listaId}
          preventdefault:mousedown
          aria-label="Clientes"
          class={cn(
            "bg-card rounded-sm border p-1.5 shadow-xs",
            posicion(props),
          )}
        >
          {b.lista.value.map((opcion, i) => (
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
