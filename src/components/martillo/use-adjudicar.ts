import { $, useSignal } from "@builder.io/qwik";
import { proximoSinVender } from "~/lib/martillo";
import type { LoteConClientes } from "~/db/lotes";
import { ventaAdjudicada } from "~/lib/martillo-campos";
import { COMISION_INVALIDA, RECIENTES } from "~/lib/martillo-ventas";
import { nombreDe } from "~/components/dueno-buscador/opciones-dueno";
import { aComision, aPesos, lotesTxt, pesos } from "~/lib/textos";
import type { MartilloState } from "./use-martillo";
import { enfocar, type MartilloEscritura } from "./use-martillo-escritura";

export const useAdjudicar = (
  m: MartilloState,
  { escribir, fallar }: MartilloEscritura,
) => {
  /** A second Enter while saving would see the old lot and overwrite "Deshacer". */
  const guardando = useSignal(false);

  const venderLote = $(
    async (lote: NonNullable<MartilloState["lote"]["value"]>) => {
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

      const grupo = m.grupo.value;
      const numero = lote.numero;
      const venta = { precio, compradorId, comisionCompra, comisionVenta };
      let antes: LoteConClientes[];
      try {
        // Worked out from the lots as the database has them now.
        antes = await escribir(
          numero,
          [numero, ...grupo],
          $((lotes: LoteConClientes[]) =>
            ventaAdjudicada(lotes, numero, venta, grupo),
          ),
        );
      } catch (err) {
        return fallar(err);
      }
      const correccion =
        antes.find((l) => l.numero === numero)?.precioVenta != null;
      const nombre = nombreDe(m.clientes.value, compradorId);
      const mas = grupo.length ? ` y ${lotesTxt(grupo.length)} más` : "";
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
      ].slice(0, RECIENTES);
      const sigue = correccion
        ? lote.numero
        : (proximoSinVender(m.datos.value?.lotes ?? [], lote.numero)?.numero ??
          null);
      await m.cargarLote(sigue);
      enfocar("r-precio");
    },
  );

  const adjudicar = $(async () => {
    const lote = m.lote.value;
    if (!lote || lote.vendidoCon !== null || guardando.value) return;
    // The fields are still being read for this lot.
    if (m.base.value?.numero !== lote.numero) return;
    guardando.value = true;
    try {
      await venderLote(lote);
    } finally {
      guardando.value = false;
    }
  });

  return adjudicar;
};
