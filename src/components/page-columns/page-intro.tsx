import { component$, Slot } from "@builder.io/qwik";

type PageIntroProps = { eyebrow: string; title: string; text?: string };

export const PageIntro = component$<PageIntroProps>(
  ({ eyebrow, title, text }) => {
    return (
      <header class="flex flex-col gap-3.5">
        <p class="text-sidebar-primary font-mono text-xs tracking-widest uppercase">
          {eyebrow}
        </p>
        <h1 class="font-serif text-7xl leading-none tracking-tight">{title}</h1>
        {text && (
          <p class="text-muted-foreground max-w-155 text-xl text-pretty">
            {text}
          </p>
        )}
        <Slot />
      </header>
    );
  },
);
