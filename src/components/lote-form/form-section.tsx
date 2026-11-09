import { component$, Slot } from "@builder.io/qwik";

type FormSectionProps = {
  id: string;
  title: string;
  text?: string;
};

export const FormSection = component$<FormSectionProps>(
  ({ id, title, text }) => {
    return (
      <fieldset id={id} class="flex min-w-0 scroll-mt-6 flex-col gap-4">
        <legend class="contents font-mono text-lg font-bold">
          <span>{title}</span>
        </legend>
        {text && <p class="text-muted-foreground -mt-2">{text}</p>}
        <Slot />
      </fieldset>
    );
  },
);
