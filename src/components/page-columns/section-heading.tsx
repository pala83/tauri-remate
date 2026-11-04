import { component$ } from "@builder.io/qwik";

export const SectionHeading = component$<{ id: string; title: string }>(
  ({ id, title }) => {
    return (
      <h2
        id={id}
        class="mt-16 mb-6 scroll-mt-6 border-b-3 pb-2.5 font-serif text-4xl"
      >
        {title}
      </h2>
    );
  },
);
