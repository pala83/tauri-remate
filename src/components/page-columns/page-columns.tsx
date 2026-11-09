import { component$, Slot } from "@builder.io/qwik";
import { useVolverAlScroll } from "./use-volver-al-scroll";

export const PageColumns = component$<{
  planilla?: boolean;
  desplazable?: boolean;
  /** The page whose scroll is kept when going to another tab and back. */
  recordar?: string;
}>(({ planilla, desplazable, recordar }) => {
  const { main, contenido, onScroll } = useVolverAlScroll(recordar);

  return (
    <div class="min-h-0 flex-1 md:flex">
      <nav
        aria-label="Contenido del apartado"
        class="bg-background md:border-sidebar-border max-h-60 shrink-0 overflow-y-auto border-b-3 pt-7 pr-4.5 pb-14 pl-5.5 md:max-h-none md:w-68 md:border-r md:border-b-0"
      >
        <Slot name="nav" />
      </nav>
      <main
        ref={main}
        onScroll$={onScroll}
        class={[
          "textura min-w-0 flex-1",
          desplazable
            ? "md:overflow-y-auto"
            : planilla
              ? "md:overflow-hidden"
              : "scroll-smooth md:overflow-y-auto",
        ]}
      >
        <div
          ref={contenido}
          class={[
            planilla
              ? "flex flex-col gap-3 px-4 pt-3 pb-4 md:h-full md:pl-6"
              : "mx-auto max-w-220 px-6 pt-12 pb-35 md:px-14",
            desplazable && "md:min-h-240",
          ]}
        >
          <Slot />
        </div>
      </main>
      <aside
        class={[
          "hidden w-59 shrink-0 overflow-y-auto px-5 pt-8.5 pb-14",
          planilla ? "2xl:block" : "xl:block",
        ]}
      >
        <Slot name="toc" />
      </aside>
    </div>
  );
});
