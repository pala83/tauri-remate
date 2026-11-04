import { cn } from "@qwik-ui/utils";
import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { PageIntro } from "~/components/page-columns/page-intro";
import { buttonVariants } from "~/components/ui";

export const LotesSinSubasta = component$<{ error?: string }>(({ error }) => {
  return (
    <PageIntro
      eyebrow="Apartado · Lotes"
      title="Lotes"
      text={error ?? "Elegí o creá un remate para cargar sus lotes."}
    >
      <Link href="/#nuevo-remate" class={cn(buttonVariants(), "mt-2 w-fit")}>
        Ir a Remates
      </Link>
    </PageIntro>
  );
});
