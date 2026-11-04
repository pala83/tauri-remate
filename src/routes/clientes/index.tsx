import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ClientesPage } from "~/components/clientes-page/clientes-page";

export default component$(() => <ClientesPage />);

export const head: DocumentHead = {
  title: "Clientes · Libro de Remates",
};
