import { component$, useComputed$, useSignal } from "@builder.io/qwik";
import type { LiquidacionState } from "~/components/liquidacion/use-liquidacion";
import { Field } from "~/components/page-columns/field";
import {
  FormMessage,
  type Mensaje,
} from "~/components/page-columns/form-message";
import { Segmentado } from "~/components/segmentado/segmentado";
import { Button, Card, Input } from "~/components/ui";
import { sugerenciaSaldo } from "~/components/liquidacion/saldo";
import { PagoAplica } from "./pago-aplica";
import { PagoMedio } from "./pago-medio";
import { PagoMonto } from "./pago-monto";
import { usePagoForm } from "./use-pago-form";

const SENTIDOS = [
  { valor: "cobro", texto: "Cobro · paga el cliente" },
  { valor: "pago", texto: "Pago · se le paga al cliente" },
];

export const PagoForm = component$<{ estado: LiquidacionState }>(
  ({ estado }) => {
    const mensaje = useSignal<Mensaje>();
    const { form, registrar } = usePagoForm(estado, mensaje);
    const saldo = useComputed$(() => estado.liq.value?.saldo ?? 0);
    const porLotes = useComputed$(() => form.aplica === "lotes");
    const sumaLotes = useComputed$(() =>
      (estado.liq.value?.compras ?? [])
        .filter((c) => form.lotes.includes(c.numero))
        .reduce((suma, c) => suma + c.resta, 0),
    );

    return (
      <Card.Root
        class="overflow-hidden shadow-lg"
        aria-label="Registrar un pago"
      >
        <header class="bg-muted flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5 border-b px-6 py-4">
          <h3 class="font-serif text-2xl">Registrar un pago</h3>
          <span class="text-muted-foreground font-mono text-sm">
            {sugerenciaSaldo(saldo.value)}
          </span>
        </header>
        <div class="flex flex-col gap-4.5 px-6 pt-5 pb-5.5">
          <div class="flex flex-col gap-2">
            <span class="font-mono text-sm font-bold">Sentido</span>
            <Segmentado
              etiqueta="Sentido"
              valor={form.sentido}
              opciones={SENTIDOS}
              onElegir$={(valor) => {
                form.sentido = valor as typeof form.sentido;
                mensaje.value = undefined;
              }}
            />
          </div>
          <div class="flex flex-wrap gap-x-5 gap-y-4">
            <Field id="pago-fecha" label="Fecha" class="min-w-45 flex-1">
              <Input
                id="pago-fecha"
                type="date"
                class="font-mono"
                value={form.fecha}
                onInput$={(_, el) => (form.fecha = el.value)}
              />
            </Field>
            <PagoMonto
              form={form}
              porLotes={porLotes.value}
              sumaLotes={sumaLotes.value}
              onEnter$={registrar}
            />
          </div>
          <PagoMedio form={form} />
          <PagoAplica form={form} estado={estado} />
        </div>
        <div class="bg-muted flex flex-wrap items-center gap-x-4 gap-y-3 border-t px-6 py-4">
          <Button onClick$={registrar}>
            {form.sentido === "cobro" ? "Registrar cobro" : "Registrar pago"}
          </Button>
          <FormMessage mensaje={mensaje.value} />
        </div>
      </Card.Root>
    );
  },
);
