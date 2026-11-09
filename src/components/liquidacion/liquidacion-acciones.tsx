import { component$, type Signal } from "@builder.io/qwik";
import { LuPrinter } from "@qwikest/icons/lucide";
import { Chip } from "~/components/chip/chip";
import { Field } from "~/components/page-columns/field";
import { FormMessage } from "~/components/page-columns/form-message";
import { Button } from "~/components/ui";
import type { ClienteResumen } from "~/db/clientes";
import type { LiquidacionState } from "./use-liquidacion";
import { useLiquidacionAcciones } from "./use-liquidacion-acciones";
import { useNotas } from "./use-notas";

type AccionesProps = {
  estado: LiquidacionState;
  cliente: Signal<ClienteResumen | undefined>;
};

export const LiquidacionAcciones = component$<AccionesProps>(
  ({ estado, cliente }) => {
    const acciones = useLiquidacionAcciones(estado, cliente);
    const notas = useNotas(estado);

    return (
      <div class="bg-muted flex flex-col gap-4 border-t px-7 py-4">
        <div class="flex flex-wrap items-center gap-x-3.5 gap-y-3">
          {estado.liq.value?.liq ? (
            <>
              <Chip
                activo={estado.liq.value.sinComision}
                onCambiar$={acciones.cambiarSinComision}
              >
                Sin comisión en este remate
              </Chip>
              <Button
                look="outline"
                class="gap-2 shadow-xs"
                onClick$={acciones.imprimirLiquidacion}
              >
                <LuPrinter class="size-4" />
                Imprimir liquidación
              </Button>
            </>
          ) : (
            <>
              <Button onClick$={acciones.generar}>Generar liquidación</Button>
              <p class="text-muted-foreground min-w-70 flex-1">
                Esto es una vista previa. Al generarla se pueden registrar pagos
                y cuotas; los importes se recalculan siempre desde los lotes.
              </p>
            </>
          )}
          <div class="ml-auto">
            <FormMessage mensaje={estado.mensaje.value} />
          </div>
        </div>
        {estado.liq.value?.liq && (
          <Field id="liq-notas" label="Notas">
            <textarea
              key={estado.liq.value.liq.id}
              id="liq-notas"
              disabled={notas.value === undefined}
              rows={2}
              class="bg-popover placeholder:text-muted-foreground min-h-19 resize-y rounded-sm border px-3 py-2.5 text-lg placeholder:italic focus:shadow-inner focus:outline-hidden"
              placeholder="Acuerdos con el cliente, observaciones…"
              value={notas.value ?? ""}
              onChange$={(_, el) => acciones.guardarNotas(el.value.trim())}
            />
          </Field>
        )}
      </div>
    );
  },
);
