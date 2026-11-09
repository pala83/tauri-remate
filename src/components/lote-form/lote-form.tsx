import { component$, useComputed$ } from "@builder.io/qwik";
import type { LotesPageState } from "~/components/lotes-page/use-lotes-page";
import { ConfirmarDialogo } from "~/components/confirmar/confirmar-dialogo";
import { distintos } from "~/lib/lotes";
import { ArticuloFields } from "./articulo-fields";
import { DetallesFields } from "./detalles-fields";
import { ImagenField } from "./imagen-field";
import { LoteFichaEncabezado } from "./lote-ficha-encabezado";
import { LoteFormAcciones } from "./lote-form-acciones";
import { useBorrarLote } from "./use-borrar-lote";
import { useLoteForm } from "./use-lote-form";
import { VentaFields } from "./venta-fields";

type LoteFormProps = { page: LotesPageState; numero: number };

/** The panel to complete a lot, over the sheet so the list stays in view. */
export const LoteForm = component$<LoteFormProps>(({ page, numero }) => {
  const { form, base, error, cargando, cerrar, guardar } = useLoteForm(
    page,
    numero,
  );
  const borrar = useBorrarLote(page, numero, error);
  const materiales = useComputed$(() =>
    distintos(page.lotes.value.map((l) => l.materiales)),
  );
  const marcas = useComputed$(() =>
    distintos(page.lotes.value.map((l) => l.marca)),
  );

  return (
    <section
      id="ficha-lote"
      aria-label={`Ficha del lote N° ${numero}`}
      onKeyDown$={(e) => {
        if (e.key === "Escape" && !e.defaultPrevented) return cerrar();
      }}
      class="hoja bg-card before:bg-secondary absolute inset-y-0 right-0 z-5 flex w-full max-w-110 flex-col border-l before:absolute before:inset-y-0 before:-left-2 before:w-1.5"
    >
      <LoteFichaEncabezado
        numero={numero}
        nombre={form.nombre}
        onCerrar$={cerrar}
      />
      <div
        id="lote-form-cuerpo"
        class="scroll-fino flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5"
        aria-busy={cargando.value}
      >
        {/* Nothing to type until the lot comes from the database. */}
        <fieldset disabled={cargando.value} class="contents">
          <ArticuloFields
            form={form}
            clientes={page.clientes.value}
            recientes={page.recientes.value.map((r) => r.id)}
            cuentas={page.cuentas.value}
            onNuevo$={page.crearDueno}
          />
          <DetallesFields
            form={form}
            materiales={materiales.value}
            marcas={marcas.value}
          />
          <ImagenField form={form} />
          <VentaFields
            form={form}
            clientes={page.clientes.value}
            onNuevo$={page.crearDueno}
          />
        </fieldset>
      </div>
      <LoteFormAcciones
        error={error.value}
        onGuardar$={guardar}
        // As read from the database on opening; deleting reads it again.
        onEliminar$={base.value?.compradorId === "" ? borrar.pedir : undefined}
        borrando={borrar.borrando.value}
      />
      <ConfirmarDialogo
        abierto={borrar.abierto}
        titulo={`¿Eliminar el lote N° ${numero}?`}
        accion="Eliminar"
        look="alert"
        onConfirmar$={borrar.borrar}
      >
        {borrar.texto.value} se elimina. No tiene la compra registrada.
      </ConfirmarDialogo>
    </section>
  );
});
