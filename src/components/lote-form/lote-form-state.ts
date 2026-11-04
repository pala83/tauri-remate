import type { LoteConClientes, ValoresLote } from "~/db/lotes";

export type TriEstado = "" | "si" | "no";

export type LoteFormState = {
  nombre: string;
  cantidad: string;
  duenoId: string;
  funciona: TriEstado;
  esNuevo: TriEstado;
  materiales: string;
  marca: string;
  precioBase: string;
  imagen: string;
  compradorId: string;
  precioVenta: string;
  vendidoCon: string;
};

export const loteVacio = (duenoId = ""): LoteFormState => ({
  nombre: "",
  cantidad: "",
  duenoId,
  funciona: "",
  esNuevo: "",
  materiales: "",
  marca: "",
  precioBase: "",
  imagen: "",
  compradorId: "",
  precioVenta: "",
  vendidoCon: "",
});

const aTri = (valor: boolean | null): TriEstado =>
  valor === null ? "" : valor ? "si" : "no";
const deTri = (valor: TriEstado) => (valor === "" ? null : valor === "si");
const aTexto = (valor: number | null) => (valor === null ? "" : String(valor));
const aEntero = (valor: string) => (valor === "" ? null : Number(valor));

export const desdeLote = (lote: LoteConClientes): LoteFormState => ({
  nombre: lote.nombre,
  cantidad: aTexto(lote.cantidad),
  duenoId: String(lote.duenoId),
  funciona: aTri(lote.funciona),
  esNuevo: aTri(lote.esNuevo),
  materiales: lote.materiales ?? "",
  marca: lote.marca ?? "",
  precioBase: aTexto(lote.precioBase),
  imagen: lote.imagen ?? "",
  compradorId: aTexto(lote.compradorId),
  precioVenta: aTexto(lote.precioVenta),
  vendidoCon: aTexto(lote.vendidoCon),
});

/** Same rules as the table's CHECKs, with messages the user can act on. */
export const errorDeLote = (form: LoteFormState) => {
  if (!form.nombre.trim()) return "Falta el nombre del artículo.";
  if (!form.duenoId) return "Elegí el dueño del artículo.";
  const conPrecio = form.precioVenta !== "" || form.vendidoCon !== "";
  const vendido = form.compradorId !== "" || conPrecio;
  if (vendido && !form.compradorId) return "Elegí el comprador del lote.";
  if (vendido && !conPrecio) return "Falta el precio de venta.";
  return undefined;
};

export const aValores = (form: LoteFormState): ValoresLote => ({
  nombre: form.nombre.trim(),
  cantidad: aEntero(form.cantidad),
  duenoId: Number(form.duenoId),
  funciona: deTri(form.funciona),
  esNuevo: deTri(form.esNuevo),
  materiales: form.materiales.trim() || null,
  marca: form.marca.trim() || null,
  precioBase: aEntero(form.precioBase),
  imagen: form.imagen || null,
  compradorId: aEntero(form.compradorId),
  // A lot sold with another one has its price there.
  precioVenta: form.vendidoCon ? null : aEntero(form.precioVenta),
  vendidoCon: aEntero(form.vendidoCon),
});
