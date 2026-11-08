import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { MartilloPage } from "~/components/martillo/martillo-page";

export default component$(() => <MartilloPage />);

export const head: DocumentHead = {
  title: "Remate · Libro de Remates",
};
