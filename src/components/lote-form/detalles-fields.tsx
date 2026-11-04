import { component$ } from "@builder.io/qwik";
import { Field } from "~/components/page-columns/field";
import { Input } from "~/components/ui";
import { FormSection } from "./form-section";
import type { LoteFormState } from "./lote-form-state";
import { TriStateToggle } from "./tri-state-toggle";

type DetallesProps = {
  form: LoteFormState;
  materiales: string[];
  marcas: string[];
};

export const DetallesFields = component$<DetallesProps>(
  ({ form, materiales, marcas }) => {
    return (
      <FormSection
        id="lote-detalles"
        title="Detalles opcionales"
        text="Completá solo lo que sepas; lo demás puede quedar en blanco."
      >
        <div class="flex gap-4">
          <Field id="lote-cantidad" label="Cantidad" class="flex-1">
            <Input
              id="lote-cantidad"
              type="number"
              min="1"
              step="1"
              class="font-mono"
              placeholder="—"
              value={form.cantidad}
              onInput$={(_, el) => (form.cantidad = el.value)}
            />
          </Field>
          <Field id="lote-base" label="Precio base" class="flex-1">
            <Input
              id="lote-base"
              type="number"
              min="0"
              step="1"
              class="font-mono"
              placeholder="—"
              value={form.precioBase}
              onInput$={(_, el) => (form.precioBase = el.value)}
            />
          </Field>
        </div>
        <TriStateToggle
          label="¿Funciona?"
          si="Funciona"
          no="No funciona"
          value={form.funciona}
          onCambio$={(valor) => {
            form.funciona = valor;
          }}
        />
        <TriStateToggle
          label="¿Es nuevo?"
          si="Nuevo"
          no="Usado"
          value={form.esNuevo}
          onCambio$={(valor) => {
            form.esNuevo = valor;
          }}
        />
        <Field id="lote-materiales" label="Materiales">
          <Input
            id="lote-materiales"
            autocomplete="off"
            list="lista-materiales"
            placeholder="Ej.: hierro fundido y madera"
            value={form.materiales}
            onInput$={(_, el) => (form.materiales = el.value)}
          />
        </Field>
        <Field id="lote-marca" label="Marca">
          <Input
            id="lote-marca"
            autocomplete="off"
            list="lista-marcas"
            placeholder="Ej.: Peugeot"
            value={form.marca}
            onInput$={(_, el) => (form.marca = el.value)}
          />
        </Field>
        <datalist id="lista-materiales">
          {materiales.map((valor) => (
            <option key={valor} value={valor} />
          ))}
        </datalist>
        <datalist id="lista-marcas">
          {marcas.map((valor) => (
            <option key={valor} value={valor} />
          ))}
        </datalist>
      </FormSection>
    );
  },
);
