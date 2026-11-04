import { component$, type QRL } from "@builder.io/qwik";
import { DuenoBuscador } from "~/components/dueno-buscador/dueno-buscador";
import { Field } from "~/components/page-columns/field";
import { Input } from "~/components/ui";
import type { ClienteResumen } from "~/db/clientes";
import { FormSection } from "./form-section";
import type { LoteFormState } from "./lote-form-state";

type ArticuloFieldsProps = {
  form: LoteFormState;
  clientes: ClienteResumen[];
  recientes: number[];
  cuentas: Record<number, number>;
  onNuevo$: QRL<(nombre: string) => Promise<number>>;
};

export const ArticuloFields = component$<ArticuloFieldsProps>((props) => {
  const { form } = props;

  return (
    <FormSection id="lote-articulo" title="Obligatorios">
      <Field id="lote-nombre" label="Artículo" required>
        <Input
          id="lote-nombre"
          autocomplete="off"
          value={form.nombre}
          onInput$={(_, el) => (form.nombre = el.value)}
        />
      </Field>
      <Field id="lote-dueno" label="Dueño" required>
        <DuenoBuscador
          id="lote-dueno"
          clientes={props.clientes}
          recientes={props.recientes}
          cuentas={props.cuentas}
          duenoId={form.duenoId ? Number(form.duenoId) : null}
          onElegir$={(id) => {
            form.duenoId = String(id);
          }}
          onNuevo$={props.onNuevo$}
        />
      </Field>
    </FormSection>
  );
});
