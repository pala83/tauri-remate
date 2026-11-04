import { component$, Slot } from "@builder.io/qwik";
import { AppHeader } from "~/components/app-header/app-header";
import { useAppStateProvider } from "~/components/app-state/app-state";

export default component$(() => {
  useAppStateProvider();

  return (
    <div class="flex min-h-screen flex-col md:h-screen md:overflow-hidden">
      <AppHeader />
      <Slot />
    </div>
  );
});
