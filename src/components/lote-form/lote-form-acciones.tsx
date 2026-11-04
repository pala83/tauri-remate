import { component$, type QRL } from "@builder.io/qwik";
import { FormMessage } from "~/components/page-columns/form-message";
import { Button } from "~/components/ui";

type AccionesProps = {
  error?: string;
  onGuardar$: QRL<(seguir: boolean) => void>;
};

export const LoteFormAcciones = component$<AccionesProps>(
  ({ error, onGuardar$ }) => {
    return (
      <div class="bg-muted flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-t px-5 py-3">
        <Button onClick$={() => onGuardar$(false)}>Guardar</Button>
        <Button
          look="outline"
          title="Guarda y abre el próximo lote sin detalles"
          onClick$={() => onGuardar$(true)}
        >
          Guardar y siguiente →
        </Button>
        {error && <FormMessage mensaje={{ tipo: "error", texto: error }} />}
      </div>
    );
  },
);
