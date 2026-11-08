import { component$ } from "@builder.io/qwik";
import { Chip } from "~/components/chip/chip";
import { Segmentado } from "~/components/segmentado/segmentado";
import { pesos } from "~/lib/textos";
import type { PlanFormState } from "./use-plan-form";

const PLAZOS = [0, 30, 60, 90, 120];

export const PlanElecciones = component$<{ plan: PlanFormState }>(
  ({ plan }) => {
    return (
      <>
        <div class="flex flex-col gap-2">
          <span class="font-mono text-sm font-bold">Plazos</span>
          <div class="flex flex-wrap gap-2.5">
            {PLAZOS.map((dias) => (
              <Chip
                key={dias}
                activo={plan.plazos.value.includes(dias)}
                onCambiar$={() => {
                  plan.plazos.value = plan.plazos.value.includes(dias)
                    ? plan.plazos.value.filter((d) => d !== dias)
                    : [...plan.plazos.value, dias];
                }}
              >
                {dias} días
              </Chip>
            ))}
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <span class="font-mono text-sm font-bold">Cubre</span>
          <Segmentado
            etiqueta="Qué cubre el plan"
            valor={plan.porLote.value ? "lote" : "cuenta"}
            opciones={[
              { valor: "cuenta", texto: "Toda la cuenta" },
              ...(plan.compras.value.length
                ? [{ valor: "lote", texto: "Un lote" }]
                : []),
            ]}
            onElegir$={(valor) => {
              plan.porLote.value = valor === "lote";
            }}
          />
          {plan.porLote.value && (
            <div class="mt-1 flex flex-wrap gap-2.5">
              {plan.compras.value.map((c) => (
                <Chip
                  key={c.numero}
                  redondo
                  activo={plan.lote.value === c.numero}
                  onCambiar$={() => {
                    plan.lote.value = c.numero;
                  }}
                >
                  N° {c.numero} · {pesos(c.resta)}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </>
    );
  },
);
