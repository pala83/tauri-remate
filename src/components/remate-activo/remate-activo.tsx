import { cn } from "@qwik-ui/utils";
import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuArrowRight, LuCalendar, LuPencil } from "@qwikest/icons/lucide";
import { LugarLink } from "~/components/lugar-link/lugar-link";
import { CardActions } from "~/components/page-columns/card-actions";
import { Sello } from "~/components/sello/sello";
import { buttonVariants, Card } from "~/components/ui";
import type { RemateResumen } from "~/db/remates";
import { estadoLargo, fechaLarga } from "~/lib/fechas";
import { RemateStat } from "./remate-stat";

export const RemateActivo = component$<{ remate: RemateResumen }>(
  ({ remate }) => {
    return (
      <Card.Root class="overflow-hidden shadow-lg">
        <div class="flex flex-col gap-3.5 px-6 py-7 md:px-8">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <Sello color="azul">Seleccionada</Sello>
            <span class="text-muted-foreground font-mono text-sm">
              {estadoLargo(remate.fecha)}
            </span>
          </div>
          <h3 class="mt-1 font-serif text-5xl">{remate.nombre}</h3>
          <p class="flex items-center gap-2 font-mono">
            <LuCalendar class="text-sidebar-primary size-4 shrink-0" />
            {fechaLarga(remate.fecha)}
            {remate.lugar && <LugarLink url={remate.lugar} />}
          </p>
        </div>
        <dl class="grid border-t sm:grid-cols-3">
          <RemateStat label="Lotes cargados" value={remate.lotes} />
          <RemateStat label="Dueños" value={remate.duenos} />
          <RemateStat
            label="Próximo N° de lote"
            value={remate.proximo}
            acento
          />
        </dl>
        <CardActions>
          <Link href="/lotes/" class={cn(buttonVariants(), "gap-2")}>
            Ir a los lotes
            <LuArrowRight class="size-4" />
          </Link>
          <Link href="/clientes/" class={buttonVariants({ look: "outline" })}>
            Ver clientes
          </Link>
          <Link
            href="/remate/"
            class={cn(buttonVariants({ look: "outline" }), "ml-auto gap-2")}
          >
            <LuPencil class="size-4" />
            Editar
          </Link>
        </CardActions>
      </Card.Root>
    );
  },
);
