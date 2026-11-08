import { component$, useSignal } from "@builder.io/qwik";
import { Segmentado } from "~/components/segmentado/segmentado";
import { Input, Label } from "~/components/ui";
import type { FiltroMartillo } from "~/lib/martillo";
import type { MartilloState } from "./use-martillo";
import { enfocarLote } from "./use-martillo-escritura";

type EncabezadoProps = { m: MartilloState; remate: string };

export const MartilloEncabezado = component$<EncabezadoProps>(
  ({ m, remate }) => {
    const irN = useSignal("");
    const error = useSignal("");

    return (
      <header class="mr-2 flex shrink-0 flex-wrap items-end justify-between gap-x-5 gap-y-2">
        <div class="flex flex-col gap-0.5">
          <p class="text-sidebar-primary font-mono text-xs tracking-widest uppercase">
            {remate}
          </p>
          <div class="flex flex-wrap items-baseline gap-x-4">
            <h1 class="font-serif text-5xl leading-none tracking-tight">
              Remate
            </h1>
            {m.marcha.value && (
              <span class="text-muted-foreground font-mono text-sm">
                {m.marcha.value.vendidos} de {m.lotes.value.length} vendidos ·{" "}
                {m.marcha.value.sinVender} sin vender
              </span>
            )}
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-x-3.5 gap-y-2">
          <Segmentado
            etiqueta="Filtrar lotes"
            valor={m.filtro.value}
            opciones={[
              {
                valor: "todos",
                texto: "Todos",
                cuenta: m.lotes.value.length,
              },
              {
                valor: "sin-vender",
                texto: "Sin vender",
                cuenta: m.marcha.value?.sinVender ?? 0,
              },
              {
                valor: "vendidos",
                texto: "Vendidos",
                cuenta: m.marcha.value?.vendidos ?? 0,
              },
            ]}
            onElegir$={(valor) => {
              m.filtro.value = valor as FiltroMartillo;
            }}
          />
          <div class="flex items-center gap-2">
            <Label
              for="r-ir"
              class="font-mono text-sm font-bold whitespace-nowrap"
            >
              Ir al N°
            </Label>
            <Input
              id="r-ir"
              type="number"
              min="1"
              class="w-23 font-mono"
              placeholder="—"
              bind:value={irN}
              onInput$={() => (error.value = "")}
              onKeyDown$={async (e, el) => {
                if (e.key !== "Enter") return;
                const n = Number(el.value);
                if (!m.lotes.value.some((l) => l.numero === n)) {
                  error.value = el.value
                    ? `No existe el N° ${n}.`
                    : "Escribí un número.";
                  return;
                }
                irN.value = "";
                m.filtro.value = "todos";
                m.mensaje.value = undefined;
                await m.cargarLote(n);
                enfocarLote();
              }}
            />
            {error.value && (
              <span role="alert" class="text-alert font-mono text-xs">
                {error.value}
              </span>
            )}
          </div>
        </div>
      </header>
    );
  },
);
