import { $, component$, useSignal } from "@builder.io/qwik";
import { LuImage } from "@qwikest/icons/lucide";
import { FormMessage } from "~/components/page-columns/form-message";
import { Button, Card } from "~/components/ui";
import { elegirImagen, urlImagen } from "~/db/imagenes";
import { errorTxt } from "~/lib/textos";
import { FormSection } from "./form-section";
import type { LoteFormState } from "./lote-form-state";

export const ImagenField = component$<{ form: LoteFormState }>(({ form }) => {
  const error = useSignal<string>();

  const elegir = $(async () => {
    try {
      const ruta = await elegirImagen();
      if (ruta) form.imagen = ruta;
      error.value = undefined;
    } catch (err) {
      error.value = errorTxt(err);
    }
  });

  return (
    <FormSection id="lote-imagen" title="Imagen">
      <div class="bg-popover border-muted-foreground flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed p-4 text-center">
        {form.imagen ? (
          <Card.Image
            src={urlImagen(form.imagen)}
            alt="Imagen del lote"
            class="h-40 w-40 rounded-sm border shadow-xs"
          />
        ) : (
          <>
            <LuImage class="text-sidebar-primary size-8" />
            <p class="text-lg">Elegí una foto desde la computadora</p>
          </>
        )}
        <div class="flex flex-wrap justify-center gap-3">
          <Button look="outline" size="sm" class="shadow-xs" onClick$={elegir}>
            {form.imagen ? "Cambiar imagen" : "Elegir archivo"}
          </Button>
          {form.imagen && (
            <Button
              look="link"
              class="text-sidebar-primary font-normal underline"
              onClick$={() => (form.imagen = "")}
            >
              Quitar
            </Button>
          )}
        </div>
        <p class="text-muted-foreground font-mono text-xs">
          JPG, PNG o WEBP · una imagen por lote
        </p>
      </div>
      <FormMessage
        mensaje={
          error.value ? { tipo: "error", texto: error.value } : undefined
        }
      />
    </FormSection>
  );
});
