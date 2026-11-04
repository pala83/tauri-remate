import { $, useSignal, useTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { LotesPageState } from "~/components/lotes-page/use-lotes-page";
import { borrarLote, crearLote } from "~/db/lotes";
import { errorTxt, titulo } from "~/lib/textos";

const enfocar = (id: string) => document.getElementById(id)?.focus();

export const useCargaRapida = (page: LotesPageState) => {
  const { url } = useLocation();
  const articulo = useSignal("");
  const duenoId = useSignal<number | null>(null);
  const guardando = useSignal(false);
  const { mensaje } = page;

  // On entering a remate, the owner is the one asked for or the last one used.
  useTask$(({ track }) => {
    const remate = track(() => page.remateCargado.value);
    if (remate === null) return;
    const pedido = Number(url.searchParams.get("dueno"));
    duenoId.value = pedido || (page.lotes.value.at(-1)?.duenoId ?? null);
    articulo.value = "";
  });

  const elegirDueno = $((id: number) => {
    duenoId.value = id;
    mensaje.value = undefined;
    enfocar("carga-articulo");
  });

  const cargar = $(async () => {
    const remateId = page.remateCargado.value;
    const nombre = articulo.value.trim().replace(/\s+/g, " ");
    // Enter again while saving must not create a second lot.
    if (guardando.value || remateId === null) return;
    if (!nombre) {
      mensaje.value = {
        tipo: "error",
        texto: "Escribí el nombre del artículo.",
      };
      return enfocar("carga-articulo");
    }
    if (duenoId.value === null) {
      mensaje.value = { tipo: "error", texto: "Elegí el dueño del lote." };
      return enfocar("carga-dueno");
    }

    guardando.value = true;
    articulo.value = "";
    try {
      const numero = await crearLote(remateId, {
        nombre,
        duenoId: duenoId.value,
      });
      const lote = await page.agregarLote(remateId, numero);
      mensaje.value = {
        tipo: "ok",
        texto: `N° ${numero} · ${nombre} — ${titulo(lote.duenoNombre)}`,
        deshacer: numero,
      };
    } catch (err) {
      // What was typed meanwhile, if anything, stays.
      if (!articulo.value) articulo.value = nombre;
      mensaje.value = { tipo: "error", texto: errorTxt(err) };
    } finally {
      guardando.value = false;
      enfocar("carga-articulo");
    }
  });

  const deshacer = $(async () => {
    const numero = mensaje.value?.deshacer;
    const remateId = page.remateCargado.value;
    const ultimo = page.lotes.value.at(-1);
    if (!numero || remateId === null || ultimo?.numero !== numero) return;
    try {
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
