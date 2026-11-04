import { sync$ } from "@builder.io/qwik";

export const evitarPorDefecto = sync$(
  (e: KeyboardEvent, el: HTMLInputElement) => {
    const abierta = el.getAttribute("aria-expanded") === "true";
    // Escape stays free when the list is closed, to close the lot's panel.
    if (
      ["ArrowUp", "ArrowDown", "Enter"].includes(e.key) ||
      (e.key === "Escape" && abierta)
    ) {
      e.preventDefault();
    }
  },
);

/** Synchronous: done later, it would select and lose the first key typed. */
export const seleccionarTexto = sync$((_: Event, el: HTMLInputElement) => {
  el.select();
});
