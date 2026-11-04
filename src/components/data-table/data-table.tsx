import { component$, Slot } from "@builder.io/qwik";
import { Card } from "~/components/ui";

export const DataTable = component$<{ columns: string[] }>(({ columns }) => {
  return (
    <Card.Root class="overflow-hidden shadow-lg">
      <div class="overflow-x-auto">
        <table class="w-full min-w-xl border-collapse text-left">
          <thead class="text-muted-foreground border-b-3 border-double font-mono text-xs tracking-wider uppercase">
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col" class="px-6 py-3 font-normal">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Slot />
          </tbody>
        </table>
      </div>
      <Slot name="empty" />
    </Card.Root>
  );
});
