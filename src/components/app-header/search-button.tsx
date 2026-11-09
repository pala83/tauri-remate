import { $, component$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { LuSearch } from "@qwikest/icons/lucide";
import { Button } from "~/components/ui";
import { irA } from "~/lib/scroll";

export const SearchButton = component$(() => {
  const navigate = useNavigate();

  const buscar = $(async () => {
    await navigate("/lotes/");
    irA("planilla-caja", "buscar-lote");
  });

  return (
    <Button
      look="ghost"
      size="icon"
      aria-label="Buscar lotes"
      onClick$={buscar}
    >
      <LuSearch class="size-5" />
    </Button>
  );
});
