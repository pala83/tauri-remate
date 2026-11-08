const CLASE = "zona-impresion";

/**
 * Prints a copy of the element as the only thing on the page. It's a direct
 * child of `body` so `global.css` can hide everything else, and `papel-claro`
 * keeps it dark ink on paper in dark mode too.
 */
export const imprimir = async (id: string) => {
  const original = document.getElementById(id);
  if (!original) return;
  document.querySelectorAll(`body > .${CLASE}`).forEach((el) => el.remove());
  const copia = original.cloneNode(true) as HTMLElement;
  copia.removeAttribute("id");
  copia.hidden = false;
  copia.className = `${CLASE} papel-claro`;
  document.body.append(copia);
  const quitar = () => copia.remove();
  window.addEventListener("afterprint", quitar, { once: true });
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("imprimir");
};
