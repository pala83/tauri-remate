import { $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useScroll } from "~/store";

/** Gives up waiting for the page to be tall enough after this long. */
const ESPERA = 3000;

/** Saves how far down the main column is, and goes back there on return. */
export const useVolverAlScroll = (pagina: string | undefined) => {
  const main = useSignal<HTMLElement>();
  const contenido = useSignal<HTMLElement>();
  const { inicial, guardar } = useScroll(pagina);

  const onScroll = $((_: Event, el: HTMLElement) => guardar(el.scrollTop));

  // The page loads in parts, so it waits until it's long enough to get there.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const el = main.value;
    const dentro = contenido.value;
    if (!inicial || !el || !dentro) return;
    const ir = () => {
      if (el.scrollHeight - el.clientHeight < inicial) return;
      el.scrollTo({ top: inicial, behavior: "instant" });
      dejar();
    };
    const observador = new ResizeObserver(ir);
    // Once the user moves it, their place counts.
    const eventos = ["wheel", "keydown", "pointerdown", "touchstart"];
    const dejar = () => {
      observador.disconnect();
      clearTimeout(reloj);
      eventos.forEach((e) => el.removeEventListener(e, dejar));
    };
    const reloj = setTimeout(dejar, ESPERA);
    eventos.forEach((e) => el.addEventListener(e, dejar, { passive: true }));
    observador.observe(dentro);
    ir();
    cleanup(dejar);
  });

  return { main, contenido, onScroll };
};
