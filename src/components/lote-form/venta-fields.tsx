import { component$, type QRL } from "@builder.io/qwik";
import { DuenoBuscador } from "~/components/dueno-buscador/dueno-buscador";
import { Field } from "~/components/page-columns/field";
import { Button, Input } from "~/components/ui";
import type { ClienteResumen } from "~/db/clientes";
import { FormSection } from "./form-section";
import type { LoteFormState } from "./lote-form-state";

type VentaProps = {
  form: LoteFormState;
  clientes: ClienteResumen[];
  onNuevo$: QRL<(nombre: string) => Promise<number>>;
};

export const VentaFields = component$<VentaProps>(
  ({ form, clientes, onNuevo$ }) => {
    return (
      <FormSection
        id="lote-venta"
        title="Venta"
        text="Sin precio de venta, el lote figura como no vendido. El comprador y el precio se cargan juntos."
      >
        <Field id="lote-comprador" label="Comprador">
          <DuenoBuscador
            id="lote-comprador"
            clientes={clientes}
            recientes={[]}
            cuentas={{}}
            duenoId={form.compradorId ? Number(form.compradorId) : null}
            onElegir$={(id) => {
              form.compradorId = String(id);
            }}
            onNuevo$={onNuevo$}
          />
          {form.compradorId && (
            <Button
              look="link"
              class="text-sidebar-primary h-auto w-fit p-0 font-normal underline"
              onClick$={() => (form.compradorId = "")}
            >
              Quitar comprador
            </Button>
          )}
        </Field>
        {form.vendidoCon ? (
          <div class="flex flex-col gap-2">
            <p class="font-mono text-sm font-bold">
              Vendido junto con el lote N° {form.vendidoCon}
            </p>
            <Button
              look="link"
              class="text-sidebar-primary h-auto w-fit p-0 font-normal underline"
              onClick$={() => (form.vendidoCon = "")}
            >
              Separar y cargarle un precio
            </Button>
          </div>
        ) : (
          <Field id="lote-precio-venta" label="Precio de venta">
            <Input
              id="lote-precio-venta"
              type="number"
              min="0"
              step="1"
              class="font-mono"
              placeholder="—"
              value={form.precioVenta}
              onInput$={(_, el) => (form.precioVenta = el.value)}
            />
          </Field>
        )}
      </FormSection>
    );
  },
);
