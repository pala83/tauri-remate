import { component$, type QRL } from "@builder.io/qwik";
import { Field } from "~/components/page-columns/field";
import { Input } from "~/components/ui";
import { pesos } from "~/lib/textos";
import type { PagoFormState } from "./use-pago-form";

type MontoProps = {
  form: PagoFormState;
  porLotes: boolean;
  sumaLotes: number;
  onEnter$: QRL<() => void>;
};

/** Paying lots leaves nothing to type: the amount is what's left of them. */
export const PagoMonto = component$<MontoProps>(
  ({ form, porLotes, sumaLotes, onEnter$ }) => {
    if (porLotes) {
      return (
        <div class="flex min-w-55 flex-1 flex-col gap-1">
          <span class="font-mono text-sm font-bold">Monto</span>
          <span class="font-serif text-3xl">{pesos(sumaLotes)}</span>
          <span class="text-muted-foreground font-mono text-xs">
            lo que resta de los lotes elegidos
          </span>
        </div>
      );
    }
    return (
      <Field id="pago-monto" label="Monto" class="min-w-55 flex-1">
        <Input
          id="pago-monto"
          inputMode="numeric"
          autocomplete="off"
          class="font-mono text-xl font-bold"
          // The form fills it with the balance: empty, it means nothing typed.
          placeholder="$ 0"
          value={form.monto}
          onInput$={(_, el) => (form.monto = el.value)}
          onKeyDown$={(e) => {
            if (e.key === "Enter" && !e.repeat) return onEnter$();
          }}
        />
      </Field>
    );
  },
);
