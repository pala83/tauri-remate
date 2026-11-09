import { component$, Slot } from "@builder.io/qwik";
import { AppHeader } from "~/components/app-header/app-header";
import { useAppStateProvider } from "~/components/app-state/app-state";
import { useMemoriaProvider } from "~/store";

export default component$(() => {
  useAppStateProvider();
  // Every page leaves its work here, to find it again when it comes back.
  useMemoriaProvider();

  return (
    <div class="flex min-h-screen flex-col md:h-screen md:overflow-hidden">
      <AppHeader />
      <Slot />
    </div>
  );
});
