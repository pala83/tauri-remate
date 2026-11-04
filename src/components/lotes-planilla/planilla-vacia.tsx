import { component$ } from "@builder.io/qwik";

export const PlanillaVacia = component$<{ sinLotes: boolean }>(
  ({ sinLotes }) => {
    if (!sinLotes) {
      return (
        <p class="text-muted-foreground p-7 text-lg italic">
          Ningún lote coincide con la búsqueda o el filtro.
        </p>
      );
    }
    return (
      <div class="flex flex-col gap-2 px-7 py-9">
        <p class="font-serif text-3xl">Este remate todavía no tiene lotes.</p>
        <p class="text-muted-foreground text-lg">
          Elegí el dueño, escribí el primer artículo abajo y presioná Enter: va
          a ser el N° 1.
        </p>
      </div>
    );
  },
);
