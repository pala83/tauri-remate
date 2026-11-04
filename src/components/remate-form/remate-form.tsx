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
import { errorRemate, valoresRemate } from "~/lib/remates";
import { irA } from "~/lib/scroll";
import { errorTxt } from "~/lib/textos";
import { RemateFields } from "./remate-fields";

export const RemateForm = component$(() => {
  const { recargar$, elegir$ } = useAppState();
  const nombre = useSignal("");
  const fecha = useSignal("");
  const lugar = useSignal("");
  const mensaje = useSignal<Mensaje>();

  const crear = $(async () => {
    const campos = {
      nombre: nombre.value,
      fecha: fecha.value,
      lugar: lugar.value,
    };
    const error = errorRemate(campos);
    if (error) {
      mensaje.value = { tipo: "error", texto: error };
      return;
    }
    try {
      const valores = valoresRemate(campos);
      const id = await crearRemate(valores);
      await recargar$();
      await elegir$(id);
      nombre.value = fecha.value = lugar.value = "";
      mensaje.value = {
        tipo: "ok",
        texto: `${valores.nombre} quedó creada y seleccionada.`,
      };
      irA("remate-activo");
    } catch (err) {
      mensaje.value = { tipo: "error", texto: errorTxt(err) };
    }
  });

  return (
    <Card.Root class="overflow-hidden shadow-lg">
      <RemateFields nombre={nombre} fecha={fecha} lugar={lugar} />
      <CardActions>
        <Button class="gap-2" onClick$={crear}>
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
