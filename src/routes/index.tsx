import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { desc } from "drizzle-orm";
import { Button, Card, Input, Label } from "~/components/ui";
import { getDb } from "~/db/client";
import { remates, type Remate } from "~/db/schema";

export default component$(() => {
  const items = useSignal<Remate[]>([]);
  const error = useSignal<string>();
  const titulo = useSignal("");
  const fecha = useSignal("");

  const load = $(async () => {
    try {
      const db = await getDb();
      items.value = await db
        .select()
        .from(remates)
        .orderBy(desc(remates.createdAt), desc(remates.id));
      error.value = undefined;
    } catch (err) {
      error.value = String(err);
    }
  });

  // The database only exists inside the Tauri webview, so load on the client.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => load());

  const create = $(async () => {
    if (!titulo.value.trim() || !fecha.value) return;
    try {
      const db = await getDb();
      await db.insert(remates).values({
        titulo: titulo.value.trim(),
        fecha: new Date(`${fecha.value}T00:00:00`),
      });
      titulo.value = "";
      fecha.value = "";
      await load();
    } catch (err) {
      error.value = String(err);
    }
  });

  return (
    <div class="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <h1 class="text-2xl font-bold">Remates</h1>

      <Card.Root>
        <Card.Header>
          <Card.Title>Nuevo remate</Card.Title>
        </Card.Header>
        <Card.Content>
          <form
            preventdefault:submit
            onSubmit$={create}
            class="flex flex-col gap-4"
          >
            <div class="flex flex-col gap-2">
              <Label for="titulo">Título</Label>
              <Input id="titulo" name="titulo" required bind:value={titulo} />
            </div>
            <div class="flex flex-col gap-2">
              <Label for="fecha">Fecha</Label>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                required
                bind:value={fecha}
              />
            </div>
            <Button type="submit">Guardar</Button>
          </form>
        </Card.Content>
      </Card.Root>

      {error.value && <p class="text-alert text-sm">{error.value}</p>}

      <ul class="flex flex-col gap-2">
        {items.value.map((r) => (
          <li key={r.id} class="border-base flex justify-between p-3">
            <span>{r.titulo}</span>
            <span class="text-muted-foreground">
              {r.fecha.toLocaleDateString()}
            </span>
          </li>
        ))}
        {items.value.length === 0 && !error.value && (
          <li class="text-muted-foreground">Todavía no hay remates.</li>
        )}
      </ul>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Remates",
};
