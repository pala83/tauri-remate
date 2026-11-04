import { $, component$, useSignal, useTask$, type QRL } from "@builder.io/qwik";
import { ToggleGroup } from "~/components/ui";
import type { TriEstado } from "./lote-form-state";

type TriStateProps = {
  label: string;
  value: TriEstado;
  si: string;
  no: string;
  onCambio$: QRL<(valor: TriEstado) => void>;
};

const SIN_INDICAR = "sin-indicar";
const ITEM =
  "hover:bg-muted aria-pressed:hover:bg-foreground not-last:border-input rounded-none border-0 font-mono not-last:border-r";

export const TriStateToggle = component$<TriStateProps>((props) => {
  const seleccion = useSignal<string>(props.value || SIN_INDICAR);

  useTask$(({ track }) => {
    seleccion.value = track(() => props.value) || SIN_INDICAR;
  });

  const cambiar = $((valor: string) => {
    // Pressing the active option deselects it, which also means "not stated".
    if (!valor) seleccion.value = SIN_INDICAR;
    const elegido = valor === "si" || valor === "no" ? valor : "";
    return props.onCambio$(elegido);
  });

  return (
    <div class="flex flex-col gap-2">
      <span class="font-mono text-sm font-bold">{props.label}</span>
      <ToggleGroup.Root
        bind:value={seleccion}
        onChange$={cambiar}
        class="bg-popover w-fit flex-wrap gap-0 overflow-hidden rounded-sm border shadow-xs"
      >
        <ToggleGroup.Item value={SIN_INDICAR} size="lg" class={ITEM}>
          Sin indicar
        </ToggleGroup.Item>
        <ToggleGroup.Item value="si" size="lg" class={ITEM}>
          {props.si}
        </ToggleGroup.Item>
        <ToggleGroup.Item value="no" size="lg" class={ITEM}>
          {props.no}
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );
});
