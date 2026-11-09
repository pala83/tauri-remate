import { component$, type QRL, type Signal } from "@builder.io/qwik";
import { LuTrash2 } from "@qwikest/icons/lucide";
import { ConfirmarDialogo } from "~/components/confirmar/confirmar-dialogo";
import { Button } from "~/components/ui";
import { useBorrarRemate } from "./use-borrar-remate";

type BorrarRemateProps = {
  id: number;
  nombre: string;
  /** Forgets the edit form's draft. */
  olvidar: QRL<() => void>;
  /** Where it says why it can't be deleted. */
  error: Signal<string | undefined>;
};

/** «Eliminar remate» and the question before doing it. */
export const BorrarRemate = component$<BorrarRemateProps>(
  ({ id, nombre, olvidar, error }) => {
    const borrar = useBorrarRemate(id, olvidar, error);

    return (
      <>
        <Button
          look="alert"
          class="ml-auto gap-2"
          disabled={borrar.borrando.value}
          onClick$={borrar.pedir}
        >
          <LuTrash2 class="size-4" />
          Eliminar remate
        </Button>
        <ConfirmarDialogo
          abierto={borrar.abierto}
          titulo="¿Eliminar el remate?"
          accion="Eliminar"
          look="alert"
          onConfirmar$={borrar.borrar}
        >
          <strong>{nombre}</strong> se elimina. No tiene lotes ni clientes.
        </ConfirmarDialogo>
      </>
    );
  },
);
