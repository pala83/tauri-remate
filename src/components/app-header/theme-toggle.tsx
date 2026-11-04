import { component$ } from "@builder.io/qwik";
import { LuMoon, LuSun } from "@qwikest/icons/lucide";
import { useTheme } from "~/components/theme/theme";
import { Button } from "~/components/ui";

export const ThemeToggle = component$(() => {
  const { theme, setTheme$ } = useTheme();
  const oscuro = theme.value === "dark";

  return (
    <Button
      look="ghost"
      size="icon"
      aria-label="Modo oscuro"
      aria-pressed={oscuro}
      onClick$={() => setTheme$(oscuro ? "light" : "dark")}
    >
      {oscuro ? <LuSun class="size-5" /> : <LuMoon class="size-5" />}
    </Button>
  );
});
