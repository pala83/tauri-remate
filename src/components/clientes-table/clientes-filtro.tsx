import { component$, type Signal } from "@builder.io/qwik";
import { ToggleGroup } from "~/components/ui";

export type FiltroClientes = "todos" | "vende" | "compra";

type FiltroProps = {
  filtro: Signal<FiltroClientes>;
  cuentas: Record<FiltroClientes, number>;
};

const ITEM =
  "gap-2 hover:bg-muted aria-pressed:hover:bg-foreground hover:bg-muted aria-pressed:hover:bg-foreground not-last:border-input rounded-none border-0 font-mono not-last:border-r";

export const ClientesFiltro = component$<FiltroProps>(({ filtro, cuentas }) => {
  return (
    <ToggleGroup.Root
      value={filtro.value}
      onChange$={(valor: string) => {
        // Pressing the active option deselects it: go back to all.
        filtro.value = (valor || "todos") as FiltroClientes;
      }}
      class="bg-popover mb-5 w-fit flex-wrap gap-0 overflow-hidden rounded-sm border shadow-xs"
    >
      <ToggleGroup.Item value="todos" size="lg" class={ITEM}>
        Todos <span>{cuentas.todos}</span>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="vende" size="lg" class={ITEM}>
        Venden <span>{cuentas.vende}</span>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="compra" size="lg" class={ITEM}>
        Compran <span>{cuentas.compra}</span>
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
});
