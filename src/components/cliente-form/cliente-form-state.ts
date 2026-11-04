export type ClienteFormState = {
  id: number | null;
  nombre: string;
  telefono: string;
  email: string;
  referido: string;
};

export const clienteVacio = (): ClienteFormState => ({
  id: null,
  nombre: "",
  telefono: "",
  email: "",
  referido: "",
});
