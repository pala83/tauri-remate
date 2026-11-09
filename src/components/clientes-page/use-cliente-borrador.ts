import { $, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
  clienteVacio,
  desdeCliente,
  type ClienteFormState,
} from "~/components/cliente-form/cliente-form-state";
import { leerCliente } from "~/db/clientes";
import { conCambios } from "~/lib/cambios";
import { useFotoClienteForm, useGuardarClienteForm } from "~/store";

/**
 * The client form, kept while going to another tab. A new client is all
 * typed by the user; one being edited is read again from the database, and
 * only what the user changed comes back over it.
 */
export const useClienteBorrador = () => {
  const foto = useFotoClienteForm();
  const nuevo = foto?.form.id === null ? foto.form : undefined;
  const form = useStore<ClienteFormState>(nuevo ?? clienteVacio());
  /** What the database said for the client being edited. */
  const base = useSignal<ClienteFormState | null>(null);
  useGuardarClienteForm({ form, base });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const id = foto?.form.id;
    if (id === undefined || id === null) return;
    try {
      const fresco = desdeCliente(await leerCliente(id));
      const previo = foto?.base
        ? { base: foto.base, form: foto.form }
        : undefined;
      const lleno = conCambios(fresco, previo);
      Object.assign(form, lleno.form);
      base.value = lleno.base;
    } catch {
      // The client is gone: the form starts empty.
    }
  });

  /** Fills the form with a client just read from the database. */
  const editar = $((cliente: ClienteFormState) => {
    Object.assign(form, cliente);
    base.value = cliente;
  });

  return { form, editar };
};
