import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { remateActivo, useAppState } from "~/components/app-state/app-state";
import { FormMessage } from "~/components/page-columns/form-message";
import { PageColumns } from "~/components/page-columns/page-columns";
import { PageIntro } from "~/components/page-columns/page-intro";
import { PageToc } from "~/components/page-columns/page-toc";
import { SectionHeading } from "~/components/page-columns/section-heading";
import { RemateActivo } from "~/components/remate-activo/remate-activo";
import { RemateForm } from "~/components/remate-form/remate-form";
import { RematesNav } from "~/components/remates-nav/remates-nav";
import { RematesTable } from "~/components/remates-table/remates-table";
import { Skeleton } from "~/components/ui";

const SECCIONES = [
  { id: "remate-activo", label: "Remate activo" },
  { id: "todos-los-remates", label: "Todos los remates" },
  { id: "nuevo-remate", label: "Nuevo remate" },
];

export default component$(() => {
  const { state } = useAppState();
  const activa = remateActivo(state);

  return (
    <PageColumns>
      <RematesNav q:slot="nav" />
      <PageToc q:slot="toc" items={SECCIONES} />
      <PageIntro
        eyebrow="Apartado · remates"
        title="Remates"
        text="Elegí el remate con la que vas a trabajar. Podés crear un remate nuevo, editar uno existente o eliminarlo."
      />
      {state.error && (
        <div class="mt-6">
          <FormMessage mensaje={{ tipo: "error", texto: state.error }} />
        </div>
      )}

      <SectionHeading id="remate-activo" title="Remate activo" />
      {!state.cargado && <Skeleton class="h-48" />}
      {activa && <RemateActivo remate={activa} />}
      {state.cargado && !activa && (
        <p class="text-muted-foreground text-lg italic">
          Creá un remate para empezar a cargar lotes.
        </p>
      )}

      <SectionHeading id="todos-los-remates" title="Todos los remates" />
      <RematesTable />

      <SectionHeading id="nuevo-remate" title="Nuevo remate" />
      <RemateForm />
    </PageColumns>
  );
});

export const head: DocumentHead = {
  title: "Remates · Creacion y edición de remates",
};
