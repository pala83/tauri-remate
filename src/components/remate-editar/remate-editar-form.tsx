import { $, component$, useSignal } from "@builder.io/qwik";
import { Link, useNavigate } from "@builder.io/qwik-city";
import { LuCheck } from "@qwikest/icons/lucide";
import { useAppState } from "~/components/app-state/app-state";
import { CardActions } from "~/components/page-columns/card-actions";
import { FormMessage } from "~/components/page-columns/form-message";
import { RemateFields } from "~/components/remate-form/remate-fields";
import { Button, buttonVariants, Card } from "~/components/ui";
import { editarRemate, type RemateResumen } from "~/db/remates";
import { aInputFecha } from "~/lib/fechas";
import { errorRemate, valoresRemate } from "~/lib/remates";
import { errorTxt } from "~/lib/textos";

export const RemateEditarForm = component$<{ remate: RemateResumen }>(
  ({ remate }) => {
    const { recargar$ } = useAppState();
    const navegar = useNavigate();
    const id = remate.id;
    const nombre = useSignal(remate.nombre);
    const fecha = useSignal(aInputFecha(remate.fecha));
    const lugar = useSignal(remate.lugar ?? "");
    const error = useSignal<string>();

    const guardar = $(async () => {
      const campos = {
        nombre: nombre.value,
        fecha: fecha.value,
        lugar: lugar.value,
      };
      error.value = errorRemate(campos);
      if (error.value) return;
      try {
        await editarRemate(id, valoresRemate(campos));
        await recargar$();
        await navegar("/");
      } catch (err) {
        error.value = errorTxt(err);
      }
    });

    return (
      <Card.Root class="mt-10 overflow-hidden shadow-lg">
        <RemateFields nombre={nombre} fecha={fecha} lugar={lugar} />
        <CardActions>
          <Button class="gap-2" onClick$={guardar}>
            <LuCheck class="size-4" />
            Guardar cambios
          </Button>
          <Link href="/" class={buttonVariants({ look: "outline" })}>
            Cancelar
          </Link>
          {error.value && (
            <FormMessage mensaje={{ tipo: "error", texto: error.value }} />
          )}
        </CardActions>
      </Card.Root>
    );
  },
);
