import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { RemateEditarPage } from "~/components/remate-editar/remate-editar-page";

export default component$(() => <RemateEditarPage />);

export const head: DocumentHead = {
  title: "Editar remate · Libro de Remates",
};
