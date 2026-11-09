import { component$ } from "@builder.io/qwik";
import { LuGavel } from "@qwikest/icons/lucide";
import { CargaMensaje } from "~/components/carga-rapida/carga-mensaje";
import { Tecla } from "~/components/tecla/tecla";
import { Button } from "~/components/ui";
import type { MartilloState } from "./use-martillo";
import type { MartilloAcciones } from "./use-martillo-acciones";

type BotonesProps = { m: MartilloState; acciones: MartilloAcciones };

export const MartilloBotones = component$<BotonesProps>(({ m, acciones }) => {
  const sinVender = m.lote.value?.compradorId === null;

  return (
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <Button id="r-adjudicar" class="gap-2.5" onClick$={acciones.adjudicar}>
        <LuGavel class="size-4" />
        {sinVender ? "Adjudicar" : "Guardar corrección"}
        <Tecla>Enter</Tecla>
      </Button>
      {sinVender ? (
        <Button
          look="outline"
          class="gap-2 shadow-xs"
          onClick$={acciones.pasar}
        >
          Pasar <Tecla>Ctrl P</Tecla>
        </Button>
      ) : (
        <Button look="outline" class="shadow-xs" onClick$={acciones.quitar}>
          Quitar adjudicación
        </Button>
      )}
      <div class="ml-auto min-w-0">
        <CargaMensaje
          mensaje={
            m.mensaje.value && {
              ...m.mensaje.value,
              // Only next to the message of the change it undoes, not a later error.
              deshacer:
                m.mensaje.value.tipo === "ok"
                  ? m.deshacer.value?.numero
                  : undefined,
            }
          }
          onDeshacer$={acciones.revertir}
        />
      </div>
    </div>
  );
});
