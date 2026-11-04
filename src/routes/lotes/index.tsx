import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LotesPage } from "~/components/lotes-page/lotes-page";

export default component$(() => <LotesPage />);

export const head: DocumentHead = {
  title: "Lotes · Libro de Remates",
};
