import { component$, type Signal } from "@builder.io/qwik";
import { Button, Input, Label } from "~/components/ui";
import type { MartilloState } from "./use-martillo";
import type { MartilloAcciones } from "./use-martillo-acciones";

type ComisionProps = { m: MartilloState; acciones: MartilloAcciones };

/** They fill both sides at once; each side can then be typed on its own. */
const ATAJOS = [
  { valor: "10", texto: "10%" },
  { valor: "3", texto: "3% vehículo" },
];

export const MartilloComision = component$<ComisionProps>(({ m, acciones }) => {
  const campos: { id: string; texto: string; senal: Signal<string> }[] = [
    { id: "r-comision-compra", texto: "Compra", senal: m.comisionCompra },
    { id: "r-comision-venta", texto: "Venta", senal: m.comisionVenta },
  ];

  return (
    <fieldset class="flex min-w-0 flex-col gap-2">
      <div class="flex items-baseline justify-between gap-3">
        <legend class="font-mono text-sm leading-5 font-bold">Comisión</legend>
        <div class="flex gap-2.5">
          {ATAJOS.map(({ valor, texto }) => (
            <Button
              key={valor}
              look="link"
              aria-pressed={
                m.comisionCompra.value === valor &&
                m.comisionVenta.value === valor
              }
              class="text-sidebar-primary h-auto p-0 font-mono text-xs font-normal underline aria-pressed:font-bold aria-pressed:no-underline"
              onClick$={() => {
                m.comisionCompra.value = valor;
                m.comisionVenta.value = valor;
              }}
            >
              {texto}
            </Button>
          ))}
        </div>
      </div>
      <div class="flex gap-3.5">
        {campos.map(({ id, texto, senal }) => (
          <div key={id} class="flex items-center gap-1.5">
            <Label for={id} class="font-mono text-xs font-bold">
              {texto}
            </Label>
            <Input
              id={id}
              inputMode="decimal"
              autocomplete="off"
              class="w-16 px-2 text-right font-mono"
              bind:value={senal}
              onKeyDown$={(e) => {
                if (e.key === "Enter") return acciones.adjudicar();
              }}
            />
            <span class="font-mono text-sm" aria-hidden="true">
              %
            </span>
          </div>
        ))}
      </div>
    </fieldset>
  );
});
