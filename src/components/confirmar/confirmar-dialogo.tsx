import { component$, Slot, type QRL, type Signal } from "@builder.io/qwik";
import { Button, Modal } from "~/components/ui";

type ConfirmarDialogoProps = {
  abierto: Signal<boolean>;
  titulo: string;
  /** The confirming button's text. */
  accion: string;
  /** `alert` for what can't be undone, like deleting. */
  look?: "primary" | "alert";
  onConfirmar$: QRL<() => void>;
};

/** Asks before doing something. Cancel, Esc or a click outside do nothing. */
export const ConfirmarDialogo = component$<ConfirmarDialogoProps>(
  ({ abierto, titulo, accion, look = "primary", onConfirmar$ }) => {
    return (
      <Modal.Root bind:show={abierto}>
        <Modal.Panel class="bg-card hoja border p-0">
          <div class="space-y-3 p-6">
            <Modal.Title class="font-serif text-2xl font-normal">
              {titulo}
            </Modal.Title>
            <Modal.Description class="text-foreground text-base">
              <Slot />
            </Modal.Description>
          </div>
          <div class="bg-muted flex flex-wrap justify-end gap-3 border-t p-4">
            <Button look="outline" onClick$={() => (abierto.value = false)}>
              Cancelar
            </Button>
            <Button look={look} onClick$={onConfirmar$}>
              {accion}
            </Button>
          </div>
        </Modal.Panel>
      </Modal.Root>
    );
  },
);
