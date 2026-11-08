import { component$ } from "@builder.io/qwik";
import { Button, Card } from "~/components/ui";
import { MartilloGrupo } from "./martillo-grupo";
import { MartilloLoteBanda } from "./martillo-lote-banda";
import { MartilloVenta } from "./martillo-venta";
import type { MartilloState } from "./use-martillo";
import { enfocarLote } from "./use-martillo-escritura";
import type { MartilloAcciones } from "./use-martillo-acciones";

type LoteProps = { m: MartilloState; acciones: MartilloAcciones };

export const MartilloLote = component$<LoteProps>(({ m, acciones }) => {
  const lote = m.lote.value;

  return (
    <Card.Root
      id="martillo"
      aria-label="Lote en el martillo"
      class="mr-2 shrink-0 shadow-md"
    >
      {!lote && m.datos.value && (
        <div class="flex flex-wrap items-center gap-4 px-6 py-5">
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <p class="font-serif text-3xl">
              {m.lotes.value.length
                ? "No quedan lotes sin vender."
                : "Este remate todavía no tiene lotes."}
            </p>
            <p class="text-muted-foreground">
              {m.lotes.value.length
                ? "Todos los lotes tienen comprador. Tocá una fila para corregir una venta."
                : "Cargalos en la pestaña Lotes."}
            </p>
          </div>
        </div>
      )}
      {lote && (
        <>
          <MartilloLoteBanda lote={lote} />
          {lote.vendidoCon !== null ? (
            <div class="flex flex-wrap items-center gap-3 px-5 py-4">
              <p class="min-w-60 flex-1">
                Se vendió junto con el N° {lote.vendidoCon}.
              </p>
              <Button
                id="r-ir-conjunto"
                look="outline"
                class="shadow-xs"
                onClick$={async () => {
                  await m.cargarLote(lote.vendidoCon);
                  enfocarLote();
                }}
              >
                Ir al N° {lote.vendidoCon}
              </Button>
              <Button
                look="outline"
                class="shadow-xs"
                onClick$={acciones.separar}
              >
                Separar del conjunto
              </Button>
            </div>
          ) : (
            <div class="flex flex-col gap-3 px-5 pt-3.5 pb-4">
              <MartilloGrupo m={m} acciones={acciones} />
              <MartilloVenta m={m} acciones={acciones} />
            </div>
          )}
        </>
      )}
    </Card.Root>
  );
});
