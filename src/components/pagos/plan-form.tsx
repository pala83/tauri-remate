import { component$ } from "@builder.io/qwik";
import type { LiquidacionState } from "~/components/liquidacion/use-liquidacion";
import { Field } from "~/components/page-columns/field";
import { FormMessage } from "~/components/page-columns/form-message";
import { Button, Input } from "~/components/ui";
import { pesos } from "~/lib/textos";
import { PlanElecciones } from "./plan-elecciones";
import { usePlanForm } from "./use-plan-form";
import type { PlanCuotasState } from "./use-plan-cuotas";

type PlanFormProps = {
  estado: LiquidacionState;
  plan: PlanCuotasState;
};

export const PlanForm = component$<PlanFormProps>(
  ({ estado, plan: cuotas }) => {
    const plan = usePlanForm(estado, cuotas);

    return (
      <div class="flex flex-col gap-4 border-b px-6 py-5">
        <PlanElecciones plan={plan} />
        <Field id="plan-monto" label="Monto total" class="max-w-65">
          <Input
            id="plan-monto"
            inputMode="numeric"
            autocomplete="off"
            class="font-mono text-lg"
            placeholder={pesos(plan.base.value)}
            bind:value={plan.monto}
          />
        </Field>
        <ul class="border-muted-foreground flex flex-col gap-1 rounded-sm border-2 border-dashed px-4 py-3 font-mono text-sm">
          {plan.vista.value.map((c, i) => (
            <li key={c.plazoDias} class="flex justify-between gap-3">
              <span>
                Cuota {i + 1} · {c.plazoDias} días
              </span>
              <strong>{pesos(c.monto)}</strong>
            </li>
          ))}
        </ul>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2.5">
          <Button onClick$={plan.guardar}>Guardar plan</Button>
          <Button
            look="outline"
            class="shadow-xs"
            onClick$={() => (cuotas.abierto.value = false)}
          >
            Cancelar
          </Button>
          <FormMessage mensaje={plan.error.value} />
        </div>
      </div>
    );
  },
);
