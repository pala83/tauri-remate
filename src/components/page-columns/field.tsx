import { component$, Slot } from "@builder.io/qwik";
import { cn } from "@qwik-ui/utils";
import { Label } from "~/components/ui";

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  class?: string;
};

export const Field = component$<FieldProps>(
  ({ id, label, required, optional, class: clase }) => {
    return (
      <div class={cn("flex min-w-0 flex-col gap-2", clase)}>
        <Label for={id} class="font-mono text-sm leading-5 font-bold">
          {label}
          {required && <span class="text-sidebar-primary"> *</span>}
          {optional && (
            <span class="text-muted-foreground font-sans font-normal italic">
              {" "}
              opcional
            </span>
          )}
        </Label>
        <Slot />
      </div>
    );
  },
);
