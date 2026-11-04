import { component$, type Signal } from "@builder.io/qwik";
import { Field } from "~/components/page-columns/field";
import { Input } from "~/components/ui";

type RemateFieldsProps = {
  nombre: Signal<string>;
  fecha: Signal<string>;
  lugar: Signal<string>;
};

export const RemateFields = component$<RemateFieldsProps>(
  ({ nombre, fecha, lugar }) => {
    return (
      <div class="flex flex-wrap gap-6 px-6 py-7 md:px-8">
        <Field
          id="remate-nombre"
          label="Nombre identificativo"
          required
          class="min-w-64 flex-3"
        >
          <Input
            id="remate-nombre"
            placeholder="Ej.: Remate de Otoño 2027"
            bind:value={nombre}
          />
        </Field>
        <Field id="remate-fecha" label="Fecha" required class="min-w-48 flex-1">
          <Input
            id="remate-fecha"
            type="date"
            class="font-mono"
            bind:value={fecha}
          />
        </Field>
        <Field
          id="remate-lugar"
          label="Lugar (link de Google Maps)"
          optional
          class="w-full"
        >
          <Input
            id="remate-lugar"
            type="url"
            autocomplete="off"
            class="font-mono"
            placeholder="Ej.: https://maps.app.goo.gl/…"
            bind:value={lugar}
          />
        </Field>
      </div>
    );
  },
);
