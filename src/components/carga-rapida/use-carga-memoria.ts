import { useSignal, useVisibleTask$, type Signal } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { LotesPageState } from "~/components/lotes-page/use-lotes-page";
import { ultimoLote } from "~/db/lotes";
import { useFotoCargaRapida, useGuardarCargaRapida } from "~/store";

/** What the quick entry starts with on entering a remate, and keeps on leaving. */
export const useCargaMemoria = (
  page: LotesPageState,
  articulo: Signal<string>,
  duenoId: Signal<number | null>,
) => {
  const { url } = useLocation();
  // Only for the first load: on changing remates it starts over.
  const foto = useSignal(useFotoCargaRapida());
  /** The owner it starts with, read from the database. */
  const duenoBase = useSignal<number | null>(null);
  useGuardarCargaRapida({
    remate: page.remateCargado,
    articulo,
    duenoId,
    duenoBase,
  });

  // The owner is the one asked for, the one the user picked before going to
  // another tab, or the last lot's, read from the database.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    const remate = track(() => page.remateCargado.value);
    if (remate === null) return;
    const antes = foto.value?.remate === remate ? foto.value : undefined;
    foto.value = undefined;
    articulo.value = antes?.articulo ?? "";
    const pedido = Number(url.searchParams.get("dueno")) || null;
    const elegido =
      antes && antes.duenoId !== antes.duenoBase ? antes.duenoId : null;
    const ultimo = (await ultimoLote(remate))?.duenoId ?? null;
    if (page.remateCargado.value !== remate) return;
    duenoBase.value = ultimo;
    duenoId.value = pedido ?? elegido ?? ultimo;
  });
};
