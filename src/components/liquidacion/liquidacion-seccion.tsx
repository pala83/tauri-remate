import { component$, type Signal } from "@builder.io/qwik";
import { SectionHeading } from "~/components/page-columns/section-heading";
import { Segmentado } from "~/components/segmentado/segmentado";
import { Card } from "~/components/ui";
import type { ClienteResumen } from "~/db/clientes";
import { lotesSinVender } from "~/lib/liquidacion";
import { titulo } from "~/lib/textos";
import { LiquidacionAcciones } from "./liquidacion-acciones";
import { Avisos } from "./liquidacion-avisos";
import { LiquidacionCabecera } from "./liquidacion-cabecera";
import { LiquidacionImpresa } from "./liquidacion-impresa";
import { LiquidacionLineas } from "./liquidacion-lineas";
import { LiquidacionTotales } from "./liquidacion-totales";
import type { LiquidacionState } from "./use-liquidacion";

type SeccionProps = {
  estado: LiquidacionState;
  cliente: Signal<ClienteResumen | undefined>;
};

export const LiquidacionSeccion = component$<SeccionProps>(
  ({ estado, cliente }) => {
    const { liq, datos, remate } = estado;
    const clienteId = cliente.value?.id ?? 0;
    const nombre = cliente.value?.nombre ?? "";

    return (
      <>
        <SectionHeading id="liquidacion" title="Liquidación" />
        {estado.remates.value.length === 0 && (
          <p class="text-muted-foreground text-lg italic">
            {titulo(nombre)} todavía no compró ni vendió en ningún remate.
          </p>
        )}
        {liq.value && remate.value && datos.value && (
          <div class="flex flex-col gap-4.5">
            <div class="flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
              <span class="font-mono text-sm font-bold">Remate</span>
              <Segmentado
                etiqueta="Remate de la liquidación"
                valor={String(estado.remateId.value)}
                opciones={estado.remates.value.map((r) => ({
                  valor: String(r.id),
                  texto: r.nombre,
                }))}
                onElegir$={(id) => estado.elegirRemate(Number(id))}
              />
            </div>
            <Card.Root class="overflow-hidden shadow-lg">
              <LiquidacionCabecera
                remate={remate.value}
                generada={!!liq.value.liq}
                saldo={liq.value.saldo}
                sinComision={liq.value.sinComision}
              />
              <div class="flex flex-col gap-6 px-7 pt-5.5 pb-6.5">
                <LiquidacionLineas
                  titulo="Compras · como comprador"
                  nota="precio + comisión de compra"
                  vacio="No compró lotes en este remate."
                  subtotalTexto="Subtotal compras"
                  subtotal={liq.value.tCompras}
                  lineas={liq.value.compras}
                  signo="+"
                  esCompra
                />
                <LiquidacionLineas
                  titulo="Ventas · como dueño"
                  nota="precio − comisión de venta"
                  vacio="No vendió lotes en este remate."
                  subtotalTexto="Subtotal ventas"
                  subtotal={liq.value.tVentas}
                  lineas={liq.value.ventas}
                  signo="−"
                />
                <Avisos avisos={estado.avisos.value} />
                {lotesSinVender(datos.value, clienteId) > 0 && (
                  <p class="text-muted-foreground font-mono text-sm">
                    Lotes propios sin vender:{" "}
                    {lotesSinVender(datos.value, clienteId)}.
                  </p>
                )}
                <LiquidacionTotales liq={liq.value} />
              </div>
              <LiquidacionAcciones estado={estado} cliente={cliente} />
            </Card.Root>
            {estado.impresa.value && (
              <LiquidacionImpresa vigente={estado.impresa.value} />
            )}
          </div>
        )}
      </>
    );
  },
);
