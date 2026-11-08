import { component$ } from "@builder.io/qwik";
import { LuAlertTriangle } from "@qwikest/icons/lucide";

export const Avisos = component$<{ avisos: string[] }>(({ avisos }) => {
  if (avisos.length === 0) return null;
  return (
    <ul class="flex flex-col gap-1.5">
      {avisos.map((aviso) => (
        <li
          key={aviso}
          class="text-sidebar-primary flex items-start gap-2 font-mono text-sm"
        >
          <LuAlertTriangle class="mt-0.5 size-4 shrink-0" />
          <span>{aviso}</span>
        </li>
      ))}
    </ul>
  );
});
