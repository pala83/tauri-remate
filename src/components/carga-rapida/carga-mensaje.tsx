import { component$, type QRL } from "@builder.io/qwik";
import type { MensajeCarga } from "~/components/lotes-page/use-lotes-acciones";
import { FormMessage } from "~/components/page-columns/form-message";
import { Button } from "~/components/ui";

type CargaMensajeProps = {
  mensaje?: MensajeCarga;
  onDeshacer$: QRL<() => void>;
};

export const CargaMensaje = component$<CargaMensajeProps>(
  ({ mensaje, onDeshacer$ }) => {
    if (!mensaje) return null;
    if (mensaje.tipo === "info") {
      return (
        <p
          role="status"
          class="text-muted-foreground truncate font-mono text-sm"
        >
          {mensaje.texto}
        </p>
      );
    }
    return (
      <div class="flex min-w-0 items-center gap-2 text-sm">
        <FormMessage mensaje={{ tipo: mensaje.tipo, texto: mensaje.texto }} />
        {mensaje.deshacer && (
          <Button
            look="link"
            class="text-sidebar-primary h-auto shrink-0 px-0.5 font-normal underline"
            onClick$={onDeshacer$}
          >
            Deshacer
          </Button>
        )}
      </div>
    );
  },
);
