import { component$, Slot } from "@builder.io/qwik";

type FormSectionProps = {
  id: string;
  title: string;
  text?: string;
  required?: boolean;
};

export const FormSection = component$<FormSectionProps>(
  ({ id, title, text, required }) => {
    return (
      <fieldset id={id} class="flex min-w-0 scroll-mt-6 flex-col gap-4">
        <legend class="contents font-mono text-lg font-bold">
          <span>
            {title}
            {required && <span class="text-sidebar-primary"> *</span>}
          </span>
        </legend>
        {text && <p class="text-muted-foreground -mt-2">{text}</p>}
        <Slot />
      </fieldset>
    );
  },
);
