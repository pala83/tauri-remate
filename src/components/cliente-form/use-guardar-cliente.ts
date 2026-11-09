import { $, useSignal, type QRL } from "@builder.io/qwik";
import type { Mensaje } from "~/components/page-columns/form-message";
import {
  clienteLlamado,
  crearCliente,
  editarCliente,
  leerCliente,
  unificarClientes,
} from "~/db/clientes";
import { errorTxt, textoCliente, titulo } from "~/lib/textos";
import { clienteVacio, type ClienteFormState } from "./cliente-form-state";

/** The client being edited, `seVa`, took the name of `queda`. */
export type Unificar = {
  queda: { id: number; nombre: string };
  seVa: { id: number; nombre: string };
};

export const useGuardarCliente = (
  form: ClienteFormState,
  onGuardado$: QRL<(id: number) => Promise<void>>,
) => {
  const mensaje = useSignal<Mensaje>();
  const guardando = useSignal(false);
  /** Asked before saving, when the new name is another client's. */
  const unificar = useSignal<Unificar>();

  const listo = $(async (id: number, texto: string) => {
    await onGuardado$(id);
    Object.assign(form, clienteVacio());
    mensaje.value = { tipo: "ok", texto };
  });

  const guardar = $(async () => {
    // A second click while saving would add the client twice.
    if (guardando.value) return;
    const nombre = textoCliente(form.nombre);
    if (!nombre) {
      mensaje.value = { tipo: "error", texto: "Falta el nombre y apellido." };
      return;
    }
    // `src/db/clientes.ts` trims them and stores empty ones as null.
    const { telefono, email, referido } = form;
    const valores = { nombre, telefono, email, referido };
    guardando.value = true;
    try {
      const editado = form.id;
      // Both read from the database now: the name is unique there.
      const otro =
        editado === null ? undefined : await clienteLlamado(nombre, editado);
      if (otro && editado !== null) {
        const { nombre: antes } = await leerCliente(editado);
        unificar.value = {
          queda: { id: otro.id, nombre: otro.nombre },
          seVa: { id: editado, nombre: antes },
        };
        return;
      }
      const id = editado ?? (await crearCliente(valores));
      if (editado !== null) await editarCliente(editado, valores);
      const hecho = editado === null ? "agregado" : "actualizado";
      await listo(id, `${titulo(nombre)} quedó ${hecho}.`);
    } catch (err) {
      mensaje.value = { tipo: "error", texto: errorTxt(err) };
    } finally {
      guardando.value = false;
    }
  });

  /** The edited client's lots, settlements and payments go to the other one. */
  const confirmar = $(async () => {
    const u = unificar.value;
    if (!u || guardando.value) return;
    guardando.value = true;
    unificar.value = undefined;
    try {
      await unificarClientes(u.queda.id, u.seVa.id);
      const texto = `${titulo(u.seVa.nombre)} se unificó con ${titulo(u.queda.nombre)}.`;
      await listo(u.queda.id, texto);
    } catch (err) {
      mensaje.value = { tipo: "error", texto: errorTxt(err) };
    } finally {
      guardando.value = false;
    }
  });

  return { mensaje, guardando, unificar, guardar, confirmar };
};
