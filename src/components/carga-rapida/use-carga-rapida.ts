import { $, useSignal } from "@builder.io/qwik";
import type { LotesPageState } from "~/components/lotes-page/use-lotes-page";
import { borrarLote, crearLote, ultimoLote } from "~/db/lotes";
import { FALTA_ARTICULO, FALTA_DUENO } from "~/lib/lotes";
import { errorTxt, espacios, titulo } from "~/lib/textos";
import { useCargaMemoria } from "./use-carga-memoria";

const enfocar = (id: string) => document.getElementById(id)?.focus();

export const useCargaRapida = (page: LotesPageState) => {
  const articulo = useSignal("");
  const duenoId = useSignal<number | null>(null);
  const guardando = useSignal(false);
  const { mensaje } = page;
  useCargaMemoria(page, articulo, duenoId);

  const elegirDueno = $((id: number) => {
    duenoId.value = id;
    mensaje.value = undefined;
    enfocar("carga-articulo");
  });

  const cargar = $(async () => {
    const remateId = page.remateCargado.value;
    const nombre = espacios(articulo.value);
    // Enter again while saving must not create a second lot.
    if (guardando.value || remateId === null) return;
    if (!nombre) {
      mensaje.value = { tipo: "error", texto: FALTA_ARTICULO };
      return enfocar("carga-articulo");
    }
    if (duenoId.value === null) {
      mensaje.value = { tipo: "error", texto: FALTA_DUENO };
      return enfocar("carga-dueno");
    }

    guardando.value = true;
    articulo.value = "";
    let numero: number | undefined;
    try {
      numero = await crearLote(remateId, { nombre, duenoId: duenoId.value });
      const lote = await page.agregarLote(remateId, numero);
      mensaje.value = {
        tipo: "ok",
        texto: `N° ${numero} · ${nombre} — ${titulo(lote.duenoNombre)}`,
        deshacer: numero,
      };
    } catch (err) {
      // Once created, giving the text back would make Enter create it twice.
      if (numero === undefined && !articulo.value) articulo.value = nombre;
      const texto = numero
        ? `El N° ${numero} quedó guardado, pero no se pudo mostrar: ${errorTxt(err)}`
        : errorTxt(err);
      mensaje.value = { tipo: "error", texto };
    } finally {
      guardando.value = false;
      enfocar("carga-articulo");
    }
  });

  const deshacer = $(async () => {
    const numero = mensaje.value?.deshacer;
    const remateId = page.remateCargado.value;
    if (!numero || remateId === null) return;
    try {
      // From the database: only the last lot can be undone, and its text
      // goes back to the field as it was saved.
      const ultimo = await ultimoLote(remateId);
      if (ultimo?.numero !== numero) return;
      await borrarLote(remateId, numero);
      await page.quitarLote(numero);
      articulo.value = ultimo.nombre;
      duenoId.value = ultimo.duenoId;
      mensaje.value = {
        tipo: "info",
        texto: `Se deshizo el N° ${numero}; el artículo volvió al campo.`,
      };
    } catch (err) {
      mensaje.value = { tipo: "error", texto: errorTxt(err) };
    }
    enfocar("carga-articulo");
  });

  /** Ctrl 1 to Ctrl 5 choose a recent owner. */
  const atajo = $((e: KeyboardEvent) => {
    if (!e.ctrlKey || !/^Digit[1-5]$/.test(e.code)) return;
    const reciente = page.recientes.value[Number(e.code.slice(5)) - 1];
    if (reciente) return elegirDueno(reciente.id);
  });

  return { articulo, duenoId, elegirDueno, cargar, deshacer, atajo };
};
