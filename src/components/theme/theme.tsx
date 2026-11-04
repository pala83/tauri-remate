import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
};

/**
 * Applies the theme before the first paint so the static page doesn't flash
 * light. Uses the stored choice, or the system preference until the user picks
 * one. There is no "system" theme: it always resolves to light or dark.
 */
const themeScript = `(() => {
  let theme;
  try { theme = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}); } catch {}
  if (theme !== "light" && theme !== "dark") {
    theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  (${applyTheme.toString()})(theme);
})();`;

export const ThemeScript = component$(() => {
  return <script dangerouslySetInnerHTML={themeScript} />;
});

export const useTheme = () => {
  const theme = useSignal<Theme>("light");

  // Read what ThemeScript already applied, so the state matches the screen.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    theme.value = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  });

  const setTheme$ = $((next: Theme) => {
    theme.value = next;
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice only lasts for this session.
    }
  });

  return { theme, setTheme$ };
};
