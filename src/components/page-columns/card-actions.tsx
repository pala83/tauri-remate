import { component$, Slot } from "@builder.io/qwik";
import { Card } from "~/components/ui";

/** The band at the bottom of a card that holds its buttons and messages. */
export const CardActions = component$(() => {
  return (
    <Card.Footer class="bg-muted flex-wrap gap-4 border-t p-4 md:px-8">
      <Slot />
    </Card.Footer>
  );
});
