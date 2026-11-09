import { $, component$, useSignal } from "@builder.io/qwik";
import { LuPlus } from "@qwikest/icons/lucide";
import { useAppState } from "~/components/app-state/app-state";
import { CardActions } from "~/components/page-columns/card-actions";
import {
  FormMessage,
  type Mensaje,
} from "~/components/page-columns/form-message";
import { Button, Card } from "~/components/ui";
import { crearRemate } from "~/db/remates";
import { irA } from "~/lib/scroll";
import { RemateFields } from "./remate-fields";
import { useRemateCampos } from "./use-remate-campos";

export const RemateForm = component$(() => {
  const { recargar$, elegir$ } = useAppState();
  const campos = useRemateCampos("remate-nuevo", null);
  const mensaje = useSignal<Mensaje>();

  const crear = $(async () => {
    const error = await campos.enviar(
      $(async (valores) => {
        const id = await crearRemate(valores);
        await recargar$();
        await elegir$(id);
        await campos.vaciar();
        mensaje.value = {
          tipo: "ok",
          texto: `${valores.nombre} quedó creada y seleccionada.`,
        };
        irA("remate-activo");
      }),
    );
    if (error) mensaje.value = { tipo: "error", texto: error };
  });

  return (
    <Card.Root class="overflow-hidden shadow-lg">
      <RemateFields
        nombre={campos.nombre}
        fecha={campos.fecha}
        lugar={campos.lugar}
      />
      <CardActions>
        <Button
          class="gap-2"
          disabled={campos.guardando.value}
          onClick$={crear}
        >
          <LuPlus class="size-4" />
          Crear remate
        </Button>
        {mensaje.value ? (
          <FormMessage mensaje={mensaje.value} />
        ) : (
          <p class="text-muted-foreground">
            La numeración de lotes de cada remate nueva empieza en el N° 1.
          </p>
        )}
      </CardActions>
    </Card.Root>
  );
});
