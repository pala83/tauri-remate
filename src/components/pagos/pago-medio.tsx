import { component$ } from "@builder.io/qwik";
import { Field } from "~/components/page-columns/field";
import { Segmentado } from "~/components/segmentado/segmentado";
import { Input } from "~/components/ui";
import { MEDIOS } from "./medios";
import type { PagoFormState } from "./use-pago-form";

const OPCIONES = Object.entries(MEDIOS).map(([valor, texto]) => ({
  valor,
  texto,
}));

/** Cash has no detail: its field isn't shown. */
const ETIQUETAS = {
  transferencia: "Banco y N° de operación",
  cheque: "Banco y N° de cheque",
  otro: "Detalle",
};

export const PagoMedio = component$<{ form: PagoFormState }>(({ form }) => {
  return (
    <>
      <div class="flex flex-col gap-2">
        <span class="font-mono text-sm font-bold">Medio</span>
        <Segmentado
          etiqueta="Medio de pago"
          valor={form.medio}
          opciones={OPCIONES}
          onElegir$={(valor) => {
            form.medio = valor as PagoFormState["medio"];
          }}
        />
      </div>
      {form.medio !== "efectivo" && (
        <div class="flex flex-wrap gap-x-5 gap-y-4">
          <Field
            id="pago-referencia"
            label={ETIQUETAS[form.medio]}
            class="min-w-65 flex-2"
          >
            <Input
              id="pago-referencia"
              autocomplete="off"
              placeholder="Ej.: Banco Nación · 0045821"
              value={form.referencia}
              onInput$={(_, el) => (form.referencia = el.value)}
            />
          </Field>
          {form.medio === "cheque" && (
            <Field
              id="pago-acredita"
              label="Se acredita el"
              class="min-w-45 flex-1"
            >
              <Input
                id="pago-acredita"
                type="date"
                class="font-mono"
                value={form.acredita}
                onInput$={(_, el) => (form.acredita = el.value)}
              />
            </Field>
          )}
        </div>
      )}
    </>
  );
});
