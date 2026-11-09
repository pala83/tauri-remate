import { titulo } from "~/lib/textos";

export type ClienteFormState = {
  id: number | null;
  nombre: string;
  telefono: string;
  email: string;
  referido: string;
};

/** A client as the form shows it. */
export const desdeCliente = (c: {
  id: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
  referido: string | null;
}): ClienteFormState => ({
  id: c.id,
  nombre: titulo(c.nombre),
  telefono: c.telefono ?? "",
  email: c.email ?? "",
  referido: titulo(c.referido ?? ""),
});

export const clienteVacio = (): ClienteFormState => ({
  id: null,
  nombre: "",
  telefono: "",
  email: "",
  referido: "",
});
