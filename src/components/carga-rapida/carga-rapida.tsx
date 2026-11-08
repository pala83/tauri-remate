import { component$, sync$ } from "@builder.io/qwik";
import { DuenoBuscador } from "~/components/dueno-buscador/dueno-buscador";
import type { LotesPageState } from "~/components/lotes-page/use-lotes-page";
import { Field } from "~/components/page-columns/field";
import { Tecla } from "~/components/tecla/tecla";
import { Button, Input } from "~/components/ui";
import { CargaMensaje } from "./carga-mensaje";
import { ProximoNumero } from "./proximo-numero";
import { SeleccionRapida } from "./seleccion-rapida";
import { useCargaRapida } from "./use-carga-rapida";

const evitarEnAtajo = sync$((e: KeyboardEvent) => {
  if (e.ctrlKey && /^Digit[1-5]$/.test(e.code)) e.preventDefault();
});

export const CargaRapida = component$<{ page: LotesPageState }>(({ page }) => {
  const carga = useCargaRapida(page);
  const recientes = page.recientes.value;

  return (
    <section
      id="carga-rapida"
      aria-label="Carga rápida de lotes"
      onKeyDown$={[evitarEnAtajo, carga.atajo]}
      class="hoja bg-card mr-2 mb-1.5 flex shrink-0 gap-4 rounded-sm border px-4 py-3 shadow-2xl"
    >
      <ProximoNumero numero={page.resumen.value.proximo} />
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <div class="flex items-end gap-4 max-md:flex-col max-md:items-stretch">
          <Field id="carga-dueno" label="Dueño" class="flex-3 gap-1">
            <DuenoBuscador
              id="carga-dueno"
              arriba
              clientes={page.clientes.value}
              recientes={recientes.map((r) => r.id)}
              cuentas={page.cuentas.value}
              duenoId={carga.duenoId.value}
              onElegir$={async (id, conEnter) => {
                await carga.elegirDueno(id);
                if (conEnter && carga.articulo.value.trim())
                  await carga.cargar();
              }}
              onNuevo$={page.crearDueno}
              onEnter$={carga.cargar}
            />
          </Field>
          <Field id="carga-articulo" label="Artículo" class="flex-4 gap-1">
            <Input
              id="carga-articulo"
              autocomplete="off"
              placeholder="Nombre del artículo y Enter"
              bind:value={carga.articulo}
              onKeyDown$={(e, el) => {
                if (e.key !== "Enter" || e.repeat) return;
                carga.articulo.value = el.value;
                return carga.cargar();
              }}
            />
          </Field>
          <Button class="h-11.5 gap-2.5" onClick$={carga.cargar}>
            Cargar <Tecla>Enter</Tecla>
          </Button>
        </div>
        <div class="flex min-h-5 items-center justify-between gap-4">
          <span class="text-muted-foreground shrink-0 font-mono text-xs tracking-wider uppercase">
            Selección rápida · últimos dueños con lote
          </span>
          <CargaMensaje
            mensaje={page.mensaje.value}
            onDeshacer$={carga.deshacer}
          />
        </div>
        <SeleccionRapida
          recientes={recientes}
          duenoId={carga.duenoId.value}
          onElegir$={carga.elegirDueno}
        />
      </div>
    </section>
  );
});
