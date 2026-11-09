import { component$, useTask$, type QRL } from "@builder.io/qwik";
import { LuPlus } from "@qwikest/icons/lucide";
import { CardActions } from "~/components/page-columns/card-actions";
import { FormMessage } from "~/components/page-columns/form-message";
import { Button, Card } from "~/components/ui";
import { ClienteFields } from "./cliente-fields";
import type { ClienteFormState } from "./cliente-form-state";
import { UnificarDialogo } from "./unificar-dialogo";
import { useGuardarCliente } from "./use-guardar-cliente";

type ClienteFormProps = {
  form: ClienteFormState;
  onGuardado$: QRL<(id: number) => Promise<void>>;
};

export const ClienteForm = component$<ClienteFormProps>(
  ({ form, onGuardado$ }) => {
    const { mensaje, guardando, unificar, guardar, confirmar } =
      useGuardarCliente(form, onGuardado$);

    // Starting to edit someone else: the last message was about another client.
    useTask$(({ track }) => {
      if (track(() => form.id) !== null) mensaje.value = undefined;
    });

    return (
      <Card.Root class="overflow-hidden shadow-lg">
        <ClienteFields form={form} />
        <CardActions>
          <Button class="gap-2" disabled={guardando.value} onClick$={guardar}>
            {form.id === null && <LuPlus class="size-4" />}
            {form.id === null ? "Agregar cliente" : "Guardar cambios"}
          </Button>
          <FormMessage mensaje={mensaje.value} />
        </CardActions>
        <UnificarDialogo unificar={unificar} onUnificar$={confirmar} />
      </Card.Root>
    );
  },
);
