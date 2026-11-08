import { $ } from "@builder.io/qwik";
import { proximoSinVender } from "~/lib/martillo";
import { ventasAdjudicar } from "~/lib/martillo-ventas";
import { aComision, aPesos, pesos, titulo } from "~/lib/textos";
import type { MartilloState } from "./use-martillo";
import { enfocar, useMartilloEscritura } from "./use-martillo-escritura";

const COMISION_INVALIDA = "La comisión tiene que ser un número de 0 a 100.";

export const useAdjudicar = (m: MartilloState) => {
  const { escribir, fallar } = useMartilloEscritura(m);

  const adjudicar = $(async () => {
    const lote = m.lote.value;
    if (!lote || lote.vendidoCon !== null) return;
    const error = (texto: string, campo: string) => {
      m.mensaje.value = { tipo: "error", texto };
      enfocar(campo);
    };
    const precio = aPesos(m.precio.value);
    const compradorId = m.compradorId.value;
    if (!precio) return error("Escribí el precio de venta.", "r-precio");
    if (compradorId === null)
      return error("Elegí el comprador.", "r-comprador");
    const comisionCompra = aComision(m.comisionCompra.value);
    if (comisionCompra === null)
      return error(COMISION_INVALIDA, "r-comision-compra");
    const comisionVenta = aComision(m.comisionVenta.value);
    if (comisionVenta === null)
      return error(COMISION_INVALIDA, "r-comision-venta");

    const correccion = lote.precioVenta !== null;
    const cambiaComprador =
      lote.compradorId !== null && lote.compradorId !== compradorId;
    const grupo = m.grupo.value;
    try {
      await escribir(
        lote.numero,
        ventasAdjudicar(
          m.lotes.value,
          lote.numero,
          { precio, compradorId, comisionCompra, comisionVenta },
          grupo,
        ),
        cambiaComprador ? [lote.numero] : [],
      );
    } catch (err) {
      return fallar(err);
    }
    const nombre = titulo(
      m.clientes.value.find((c) => c.id === compradorId)?.nombre ?? "",
    );
    const mas = grupo.length
      ? ` y ${grupo.length} ${grupo.length === 1 ? "lote más" : "lotes más"}`
      : "";
    const texto = `N° ${lote.numero}${mas} → ${nombre} por ${pesos(precio)}.`;
    m.mensaje.value = {
      tipo: "ok",
      texto: `${correccion ? "Corrección guardada" : "Adjudicado"}: ${texto}`,
    };
    m.ultimo.value = `N° ${lote.numero} · ${pesos(precio)}`;
    m.recien.value = lote.numero;
    m.recientes.value = [
      compradorId,
      ...m.recientes.value.filter((id) => id !== compradorId),
    ].slice(0, 5);
    const sigue = correccion
      ? lote.numero
      : (proximoSinVender(m.datos.value?.lotes ?? [], lote.numero)?.numero ??
        null);
    await m.cargarLote(sigue);
    enfocar("r-precio");
  });

  return adjudicar;
};
