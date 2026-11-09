import { component$ } from "@builder.io/qwik";
import { LuAlertCircle, LuCheck } from "@qwikest/icons/lucide";
import { cn } from "@qwik-ui/utils";
import { Alert } from "~/components/ui";

export type Mensaje = { tipo: "ok" | "error"; texto: string };

export const FormMessage = component$<{ mensaje?: Mensaje }>(({ mensaje }) => {
  if (!mensaje) return null;
  const esError = mensaje.tipo === "error";

  return (
    // The colors are its own: the alert's looks only add a border, which is off.
    <Alert.Root
      role={esError ? "alert" : "status"}
      class={cn(
        "w-auto border-0 bg-transparent p-0 [&>svg]:top-0.5 [&>svg]:left-0",
        esError
          ? "text-alert [&>svg]:text-alert"
          : "text-sidebar-accent [&>svg]:text-sidebar-accent",
      )}
    >
      {esError ? <LuAlertCircle class="size-4" /> : <LuCheck class="size-4" />}
      <Alert.Description class="font-mono">{mensaje.texto}</Alert.Description>
    </Alert.Root>
  );
});
