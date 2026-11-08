import { component$ } from "@builder.io/qwik";
import { Tecla } from "~/components/tecla/tecla";

export const Atajos = component$<{
  items: { teclas: string[]; texto: string }[];
}>(({ items }) => {
  return (
    <section class="mt-8">
      <h2 class="mb-3 font-bold">Atajos</h2>
      <dl class="flex flex-col gap-2.5">
        {items.map(({ teclas, texto }) => (
          <div key={texto} class="flex items-baseline gap-2.5">
            <dt class="flex shrink-0 gap-1">
              {teclas.map((tecla) => (
                <Tecla key={tecla}>{tecla}</Tecla>
              ))}
            </dt>
            <dd class="text-muted-foreground">{texto}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
});
