import { $, useSignal, useStore } from "@builder.io/qwik";
import type { LotesPageState } from "~/components/lotes-page/use-lotes-page";
import { editarLote, lotesDeVenta } from "~/db/lotes";
import { filtrarLotes, sinDetalles } from "~/lib/lotes";
import { errorTxt } from "~/lib/textos";
import { aValores, errorDeLote, loteVacio } from "./lote-form-state";
import { useLoteLectura } from "./use-lote-lectura";

export const useLoteForm = (page: LotesPageState, numero: number) => {
  const form = useStore(loteVacio());
  const error = useSignal<string>();
  const { base, cargando } = useLoteLectura(page, numero, form, error);
  const guardando = useSignal(false);

  const cerrar = $(() => {
    page.ficha.value = null;
    document.getElementById("carga-articulo")?.focus();
  });

  const guardar = $(async (seguir: boolean) => {
    const remateId = page.remateCargado.value;
    if (!base.value || remateId === null || guardando.value) return;
    error.value = errorDeLote(form);
    if (error.value) return;
    guardando.value = true;
    try {
      // From the database: the lots sold with this one, right now.
      const vinculados = (await lotesDeVenta(remateId, [numero])).filter(
        (l) => l.vendidoCon === numero,
      );
      if (vinculados.length && !(form.precioVenta && form.compradorId)) {
        error.value = `Se vendió junto con el N° ${vinculados.map((l) => l.numero).join(", ")}: separalos antes de quitarle la venta.`;
        return;
      }
      await editarLote(remateId, numero, aValores(form));
      await page.refrescarLote(remateId, numero);
    } catch (err) {
      error.value = errorTxt(err);
      return;
    } finally {
      guardando.value = false;
    }
    const lotes = page.lotes.value;
    const proximo = seguir
      ? (lotes.find((l) => l.numero > numero && sinDetalles(l)) ??
        lotes.find((l) => l.numero !== numero && sinDetalles(l)))
      : undefined;
    page.mensaje.value = {
      tipo: "info",
      texto:
        seguir && !proximo
          ? `N° ${numero} guardado. No quedan lotes sin detalles.`
          : `N° ${numero} actualizado.`,
    };
    if (!proximo) return cerrar();
    page.ficha.value = proximo.numero;
    // From the list just saved: `filas` is computed and lags behind it.
    const filas = filtrarLotes(lotes, page.busqueda.value, page.filtro.value);
    await page.virtual.mostrar(filas, proximo.numero);
  });

  return { form, base, error, cargando, cerrar, guardar };
};
