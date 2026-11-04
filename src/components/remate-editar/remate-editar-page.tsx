import { component$, useComputed$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuArrowLeft } from "@qwikest/icons/lucide";
import { cn } from "@qwik-ui/utils";
import { remateActivo, useAppState } from "~/components/app-state/app-state";
import { PageColumns } from "~/components/page-columns/page-columns";
import { PageIntro } from "~/components/page-columns/page-intro";
import { buttonVariants, Skeleton } from "~/components/ui";
import { RemateEditarForm } from "./remate-editar-form";

export const RemateEditarPage = component$(() => {
  const { state } = useAppState();
  const activa = useComputed$(() => remateActivo(state));

  return (
    <PageColumns>
      <Link
        q:slot="nav"
        href="/"
        class={cn(buttonVariants({ look: "ghost" }), "gap-2 px-2 font-normal")}
      >
        <LuArrowLeft class="size-4 shrink-0" />
        Volver a remates
      </Link>
      <PageIntro
        eyebrow="Apartado · remates"
        title="Editar remate"
        text="Corregí el nombre o la fecha, y agregá el lugar con su link de Google Maps."
      />
      {!state.cargado && <Skeleton class="mt-10 h-48" />}
      {activa.value && (
        <RemateEditarForm key={activa.value.id} remate={activa.value} />
      )}
      {state.cargado && !activa.value && (
        <p class="text-muted-foreground mt-10 text-lg italic">
          No hay ningún remate para editar. Creá uno en Remates.
        </p>
      )}
    </PageColumns>
  );
});
