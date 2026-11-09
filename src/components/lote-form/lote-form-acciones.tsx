import { component$, type QRL } from "@builder.io/qwik";
import { LuTrash2 } from "@qwikest/icons/lucide";
import { FormMessage } from "~/components/page-columns/form-message";
import { Button } from "~/components/ui";

type AccionesProps = {
  error?: string;
  onGuardar$: QRL<(seguir: boolean) => void>;
  /** Only for a lot whose sale isn't registered: otherwise there's no delete. */
  onEliminar$?: QRL<() => void>;
  borrando?: boolean;
};

export const LoteFormAcciones = component$<AccionesProps>(
  ({ error, onGuardar$, onEliminar$, borrando }) => {
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
        {onEliminar$ && (
          <Button
            look="ghost"
            size="icon"
            class="text-alert ml-auto"
            title="Eliminar lote"
            aria-label="Eliminar lote"
            disabled={borrando}
            onClick$={onEliminar$}
          >
            <LuTrash2 class="size-4" />
          </Button>
        )}
        {error && <FormMessage mensaje={{ tipo: "error", texto: error }} />}
      </div>
    );
  },
);
