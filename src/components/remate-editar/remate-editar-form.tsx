import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Link, useNavigate } from "@builder.io/qwik-city";
import { LuCheck } from "@qwikest/icons/lucide";
import { useAppState } from "~/components/app-state/app-state";
import { CardActions } from "~/components/page-columns/card-actions";
import { FormMessage } from "~/components/page-columns/form-message";
import { RemateFields } from "~/components/remate-form/remate-fields";
import { useRemateCampos } from "~/components/remate-form/use-remate-campos";
import { Button, buttonVariants, Card } from "~/components/ui";
import { editarRemate, leerRemate, type RemateResumen } from "~/db/remates";
import { errorTxt } from "~/lib/textos";
import { aInputFecha } from "~/lib/fechas";
import { BorrarRemate } from "./borrar-remate";

export const RemateEditarForm = component$<{ remate: RemateResumen }>(
  ({ remate }) => {
    const { recargar$ } = useAppState();
    const navegar = useNavigate();
    const campos = useRemateCampos("remate-editar", remate.id);
    const error = useSignal<string>();

    // From the database, not the list of remates in memory.
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async () => {
      try {
        const leido = await leerRemate(remate.id);
        await campos.rellenar({
          nombre: leido.nombre,
          fecha: aInputFecha(leido.fecha),
          lugar: leido.lugar ?? "",
        });
      } catch (err) {
        error.value = errorTxt(err);
      }
    });

    const guardar = $(async () => {
      const id = remate.id;
      error.value = await campos.enviar(
        $(async (valores) => {
          await editarRemate(id, valores);
          await campos.olvidar();
          await recargar$();
          await navegar("/");
        }),
      );
    });

    return (
      <Card.Root class="mt-10 overflow-hidden shadow-lg">
        <RemateFields
          nombre={campos.nombre}
          fecha={campos.fecha}
          lugar={campos.lugar}
        />
        <CardActions>
          <Button
            class="gap-2"
            disabled={campos.guardando.value || !campos.base.value}
            onClick$={guardar}
          >
            <LuCheck class="size-4" />
            Guardar cambios
          </Button>
          <Link
            href="/"
            class={buttonVariants({ look: "outline" })}
            onClick$={campos.olvidar}
          >
            Cancelar
          </Link>
          <BorrarRemate
            id={remate.id}
            nombre={remate.nombre}
            olvidar={campos.olvidar}
            error={error}
          />
          {error.value && (
            // Under the buttons, so none of them moves.
            <div class="w-full">
              <FormMessage mensaje={{ tipo: "error", texto: error.value }} />
            </div>
          )}
        </CardActions>
      </Card.Root>
    );
  },
);
