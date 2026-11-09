import { $, component$, useSignal, useTask$, type QRL } from "@builder.io/qwik";
import { GRUPO, OPCION } from "~/components/segmentado/clases";
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

export const TriStateToggle = component$<TriStateProps>((props) => {
  // The task below sets it from `value`, also before the first render.
  const seleccion = useSignal<string>(SIN_INDICAR);

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
        class={GRUPO}
      >
        <ToggleGroup.Item value={SIN_INDICAR} size="lg" class={OPCION}>
          Sin indicar
        </ToggleGroup.Item>
        <ToggleGroup.Item value="si" size="lg" class={OPCION}>
          {props.si}
        </ToggleGroup.Item>
        <ToggleGroup.Item value="no" size="lg" class={OPCION}>
          {props.no}
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );
});
