import {
  $,
  useComputed$,
  useSignal,
  useVisibleTask$,
  type Signal,
} from "@builder.io/qwik";
import type { LoteConClientes } from "~/db/lotes";

/** Rows drawn above and below the visible ones, so fast scrolling isn't blank. */
const MARGEN = 8;
/** Rows drawn before there's one to measure. */
const FILAS_INICIALES = 30;

/** Only the visible rows of a long list go in the DOM. */
export const usePlanillaVirtual = (filas: Signal<LoteConClientes[]>) => {
  const caja = useSignal<HTMLElement>();
  const inicio = useSignal(0);
  const altoCaja = useSignal(0);
  const altoFila = useSignal(0);
  const destino = useSignal<{ fila: number | "fin" }>();

  const rango = useComputed$(() => {
    const total = filas.value.length;
    const porPantalla = altoFila.value
      ? Math.ceil(altoCaja.value / altoFila.value)
      : FILAS_INICIALES;
    const primera = Math.min(inicio.value, Math.max(0, total - porPantalla));
    const desde = Math.max(0, primera - MARGEN);
    const hasta = Math.min(total, desde + porPantalla + 2 * MARGEN);
    return {
      desde,
      hasta,
      arriba: desde * altoFila.value,
      abajo: (total - hasta) * altoFila.value,
    };
  });

  const onScroll = $((_: Event, el: HTMLElement) => {
    if (!altoFila.value) return;
    const fila = Math.floor(el.scrollTop / altoFila.value);
    if (fila !== inicio.value) inicio.value = fila;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    const el = track(() => caja.value);
    if (!el) return;
    const observador = new ResizeObserver(() => {
      altoCaja.value = el.clientHeight;
    });
    observador.observe(el);
    cleanup(() => observador.disconnect());
  });

  // The row height comes from its classes, so it's read from the DOM.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => filas.value.length);
    if (altoFila.value) return;
    const fila = caja.value?.querySelector<HTMLElement>("[data-lote]");
    if (fila) altoFila.value = fila.offsetHeight;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    const pedido = track(() => destino.value);
    const alto = track(() => altoFila.value);
    const el = caja.value;
    if (!pedido || !el || !alto) return;
    // The new heights of the rows left out reach the DOM on the next frame.
    const irA = () => {
      el.scrollTop =
        pedido.fila === "fin"
          ? el.scrollHeight
          : Math.max(0, (pedido.fila - 2) * alto);
      inicio.value = Math.floor(el.scrollTop / alto);
    };
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(irA);
    });
    cleanup(() => cancelAnimationFrame(frame));
  });

  return { caja, inicio, rango, destino, onScroll };
};

export type PlanillaVirtual = ReturnType<typeof usePlanillaVirtual>;
