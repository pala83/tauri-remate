import { component$, useSignal } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";
import { LuMapPin } from "@qwikest/icons/lucide";
import { useAppState } from "~/components/app-state/app-state";
import { buttonVariants } from "~/components/ui";
import { abrirLugar } from "~/lib/lugar";
import { errorTxt } from "~/lib/textos";

/** The remate's place: an icon that opens its Google Maps link. */
export const LugarLink = component$<{ url: string }>(({ url }) => {
  const { state } = useAppState();
  /** The error this link showed, which a later success takes away. */
  const propio = useSignal<string>();

  return (
    <a
      href={url}
      aria-label="Ver en Google Maps"
      title="Ver en Google Maps"
      preventdefault:click
      onClick$={async () => {
        try {
          await abrirLugar(url);
          if (state.error && state.error === propio.value)
            state.error = undefined;
        } catch (err) {
          state.error = propio.value = errorTxt(err);
        }
      }}
      class={cn(buttonVariants({ look: "ghost" }), "h-8 w-8 shrink-0 px-0")}
    >
      <LuMapPin class="text-sidebar-primary size-4" />
    </a>
  );
});
