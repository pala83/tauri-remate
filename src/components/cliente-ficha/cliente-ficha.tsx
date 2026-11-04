import { cn } from "@qwik-ui/utils";
import { component$, type QRL } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { LuPlus } from "@qwikest/icons/lucide";
import { CardActions } from "~/components/page-columns/card-actions";
import { RolBadges } from "~/components/rol-badges/rol-badges";
import { Avatar, Button, buttonVariants, Card } from "~/components/ui";
import type { ClienteResumen, Historial } from "~/db/clientes";
import { iniciales, titulo } from "~/lib/textos";
import { HistorialLista } from "./historial-lista";

type FichaProps = {
  cliente: ClienteResumen;
  historial: Historial;
  onEditar$: QRL<() => void>;
};

export const ClienteFicha = component$<FichaProps>(
  ({ cliente, historial, onEditar$ }) => {
    const contacto = [cliente.telefono, cliente.email]
      .filter(Boolean)
      .join(" · ");

    return (
      <Card.Root class="overflow-hidden shadow-lg">
        <div class="flex flex-wrap items-center gap-6 px-6 py-7 md:px-8">
          <Avatar.Root class="bg-muted h-20 w-20 rounded-sm border font-serif text-4xl shadow-sm">
            {iniciales(cliente.nombre)}
          </Avatar.Root>
          <div class="flex min-w-64 flex-1 flex-col gap-2">
            <h3 class="font-serif text-4xl">{titulo(cliente.nombre)}</h3>
            <RolBadges aporta={cliente.aporta} compro={cliente.compro} />
            {contacto && <p class="font-mono text-sm">{contacto}</p>}
            {cliente.referido && (
              <p class="text-muted-foreground">
                Suele pagar a su nombre: {titulo(cliente.referido)}
              </p>
            )}
          </div>
        </div>
        <div class="bg-secondary text-secondary-foreground flex flex-col gap-6 border-t p-6 font-mono text-sm md:px-8">
          <HistorialLista
            titulo="Venta"
            vacio="No vendio."
            items={historial.aportados}
          />
          <HistorialLista
            titulo="Compra"
            vacio="Sin compras registradas."
            items={historial.comprados}
          />
        </div>
        <CardActions>
          <Link
            href={`/lotes/?dueno=${cliente.id}`}
            class={cn(buttonVariants(), "gap-2")}
          >
            <LuPlus class="size-4" />
            Cargar lote a su nombre
          </Link>
          <Button look="outline" onClick$={onEditar$}>
            Editar datos
          </Button>
        </CardActions>
      </Card.Root>
    );
  },
);
