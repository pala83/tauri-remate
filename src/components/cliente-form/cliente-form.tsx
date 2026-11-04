import { $, component$, useSignal, type QRL } from "@builder.io/qwik";
import { LuPlus } from "@qwikest/icons/lucide";
import { CardActions } from "~/components/page-columns/card-actions";
import {
  FormMessage,
  type Mensaje,
} from "~/components/page-columns/form-message";
import { Button, Card } from "~/components/ui";
import { crearCliente, editarCliente } from "~/db/clientes";
import { errorTxt, textoCliente, titulo } from "~/lib/textos";
import { ClienteFields } from "./cliente-fields";
import { clienteVacio, type ClienteFormState } from "./cliente-form-state";

type ClienteFormProps = {
  form: ClienteFormState;
  onGuardado$: QRL<(id: number) => Promise<void>>;
};

export const ClienteForm = component$<ClienteFormProps>(
  ({ form, onGuardado$ }) => {
    const mensaje = useSignal<Mensaje>();

    const guardar = $(async () => {
      const nombre = textoCliente(form.nombre);
      if (!nombre) {
        mensaje.value = { tipo: "error", texto: "Falta el nombre y apellido." };
        return;
      }
      const valores = {
        nombre,
        telefono: form.telefono.trim() || null,
        email: form.email.trim() || null,
        referido: form.referido.trim() || null,
      };
      try {
        const editado = form.id;
        const id = editado ?? (await crearCliente(valores));
        if (editado !== null) await editarCliente(editado, valores);
        await onGuardado$(id);
        Object.assign(form, clienteVacio());
        mensaje.value = {
          tipo: "ok",
          texto: `${titulo(nombre)} quedó ${editado === null ? "agregado" : "actualizado"}.`,
        };
      } catch (err) {
        mensaje.value = { tipo: "error", texto: errorTxt(err) };
      }
    });

    return (
      <Card.Root class="overflow-hidden shadow-lg">
        <ClienteFields form={form} />
        <CardActions>
          <Button class="gap-2" onClick$={guardar}>
            {form.id === null && <LuPlus class="size-4" />}
            {form.id === null ? "Agregar cliente" : "Guardar cambios"}
          </Button>
          <FormMessage mensaje={mensaje.value} />
        </CardActions>
      </Card.Root>
    );
  },
);
