import type { LoteConClientes, ValoresLote } from "~/db/lotes";
import { FALTA_ARTICULO, FALTA_DUENO } from "~/lib/lotes";
import { espacios } from "~/lib/textos";

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

export const loteVacio = (): LoteFormState => ({
  nombre: "",
  cantidad: "",
  duenoId: "",
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

/** Empty, or whole pesos and units: the field's `min` and `step` are only hints. */
const entero = (valor: string, desde: number) =>
  valor === "" || (/^\d+$/.test(valor) && Number(valor) >= desde);

/** Same rules as the table's CHECKs, with messages the user can act on. */
export const errorDeLote = (form: LoteFormState) => {
  if (!form.nombre.trim()) return FALTA_ARTICULO;
  if (!form.duenoId) return FALTA_DUENO;
  if (!entero(form.cantidad, 1))
    return "La cantidad tiene que ser un número entero, desde 1.";
  if (!entero(form.precioBase, 0))
    return "El precio base tiene que ser un número entero de pesos.";
  if (!entero(form.precioVenta, 1))
    return "El precio de venta tiene que ser un número entero de pesos, mayor que 0.";
  const conPrecio = form.precioVenta !== "" || form.vendidoCon !== "";
  const vendido = form.compradorId !== "" || conPrecio;
  if (vendido && !form.compradorId) return "Elegí el comprador del lote.";
  if (vendido && !conPrecio) return "Falta el precio de venta.";
  return undefined;
};

export const aValores = (form: LoteFormState): ValoresLote => ({
  nombre: espacios(form.nombre),
  cantidad: aEntero(form.cantidad),
  duenoId: Number(form.duenoId),
  funciona: deTri(form.funciona),
  esNuevo: deTri(form.esNuevo),
  materiales: espacios(form.materiales) || null,
  marca: espacios(form.marca) || null,
  precioBase: aEntero(form.precioBase),
  imagen: form.imagen || null,
  compradorId: aEntero(form.compradorId),
  // A lot sold with another one has its price there.
  precioVenta: form.vendidoCon ? null : aEntero(form.precioVenta),
  vendidoCon: aEntero(form.vendidoCon),
});
