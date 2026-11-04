import { cn } from "@qwik-ui/utils";
import { component$, useComputed$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuArrowLeftRight, LuGavel } from "@qwikest/icons/lucide";
import { remateActivo, useAppState } from "~/components/app-state/app-state";
import { buttonVariants } from "~/components/ui";
import { fechaCorta } from "~/lib/fechas";
import { AppTabs } from "./app-tabs";
import { SearchButton } from "./search-button";
import { ThemeToggle } from "./theme-toggle";

export const AppHeader = component$(() => {
  const { state } = useAppState();
  const activa = useComputed$(() => remateActivo(state));

  return (
    <header class="bg-background flex min-h-17 flex-wrap items-center gap-x-7 gap-y-2 border-b-3 px-7 py-2">
      <div class="flex min-w-0 items-center gap-3">
        <span class="border-base bg-primary text-primary-foreground grid size-10 shrink-0 place-items-center rounded-sm shadow-xs">
          <LuGavel class="size-5" />
        </span>
        <span class="font-serif text-3xl leading-none whitespace-nowrap">
          Talonario digital
        </span>
        {activa.value && (
          <span class="text-sidebar-primary hidden pt-1 font-mono text-xs whitespace-nowrap lg:inline">
            {activa.value.nombre} · {fechaCorta(activa.value.fecha)}
          </span>
        )}
      </div>
      <AppTabs />
      <div class="flex items-center gap-2">
        <Link
          href="/#todos-los-remates"
          aria-label="Cambiar remate"
          class={cn(
            buttonVariants({ look: "outline", size: "sm" }),
            "mr-2 gap-2 font-normal shadow-xs",
          )}
        >
          <LuArrowLeftRight class="size-4" />
          <span class="hidden sm:inline">Cambiar remate</span>
        </Link>
        <SearchButton />
        <ThemeToggle />
      </div>
    </header>
  );
});
