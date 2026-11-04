import { component$ } from "@builder.io/qwik";
import { Field } from "~/components/page-columns/field";
import { Input } from "~/components/ui";
import type { ClienteFormState } from "./cliente-form-state";

export const ClienteFields = component$<{ form: ClienteFormState }>(
  ({ form }) => {
    return (
      <div class="grid gap-6 p-6 sm:grid-cols-2 md:px-8">
        <Field
          id="cliente-nombre"
          label="Nombre y apellido"
          required
          class="sm:col-span-2"
        >
          <Input
            id="cliente-nombre"
            placeholder="Ej.: Rosa Medina"
            value={form.nombre}
            onInput$={(_, el) => (form.nombre = el.value)}
          />
        </Field>
        <Field id="cliente-telefono" label="Teléfono" optional>
          <Input
            id="cliente-telefono"
            type="tel"
            value={form.telefono}
            onInput$={(_, el) => (form.telefono = el.value)}
          />
        </Field>
        <Field id="cliente-email" label="Email" optional>
          <Input
            id="cliente-email"
            type="email"
            value={form.email}
            onInput$={(_, el) => (form.email = el.value)}
          />
        </Field>
        <Field
          id="cliente-referido"
          label="Referido (quien suele pagar a su nombre)"
          optional
          class="sm:col-span-2"
        >
          <Input
            id="cliente-referido"
            value={form.referido}
            onInput$={(_, el) => (form.referido = el.value)}
          />
        </Field>
      </div>
    );
  },
);
