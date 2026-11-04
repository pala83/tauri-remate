import { component$, Slot } from "@builder.io/qwik";

export const NavSection = component$<{ title: string }>(({ title }) => {
  return (
    <section class="flex flex-col gap-1">
      <h2 class="mb-2.5 border-b-3 px-2.5 pb-2.5 font-mono font-bold">
        {title}
      </h2>
      <Slot />
    </section>
  );
});
