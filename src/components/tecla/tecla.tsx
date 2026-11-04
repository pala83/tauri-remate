import { component$, Slot } from "@builder.io/qwik";

/** A keyboard key, drawn like a small stamp. */
export const Tecla = component$(() => {
  return (
    <kbd class="bg-card text-foreground inline-block rounded-xs border border-b-3 px-1 font-mono text-xs leading-4 font-bold whitespace-nowrap">
      <Slot />
    </kbd>
  );
});
