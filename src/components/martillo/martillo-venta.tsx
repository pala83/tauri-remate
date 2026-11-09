import { component$, useComputed$ } from "@builder.io/qwik";
import { DuenoBuscador } from "~/components/dueno-buscador/dueno-buscador";
import { Avisos } from "~/components/liquidacion/liquidacion-avisos";
import { Field } from "~/components/page-columns/field";
import { Input } from "~/components/ui";
import { pagoLotesVigentes } from "~/lib/liquidacion";
import { avisosVenta } from "~/lib/martillo-avisos";
import { calculoVenta } from "~/lib/martillo-marcha";
import { aComision, aPesos } from "~/lib/textos";
import { MartilloBotones } from "./martillo-botones";
import { MartilloComision } from "./martillo-comision";
import { MartilloRecientes } from "./martillo-recientes";
import type { MartilloState } from "./use-martillo";
import type { MartilloAcciones } from "./use-martillo-acciones";

type VentaProps = { m: MartilloState; acciones: MartilloAcciones };

export const MartilloVenta = component$<VentaProps>(({ m, acciones }) => {
  const calculo = useComputed$(() =>
    m.lote.value && m.datos.value
      ? calculoVenta(
          m.datos.value,
          m.clientes.value,
          m.lote.value,
          aPesos(m.precio.value),
          m.compradorId.value,
          aComision(m.comisionCompra.value),
          aComision(m.comisionVenta.value),
        )
      : "",
  );
  const avisos = useComputed$(() =>
    m.lote.value
      ? avisosVenta(
          m.lote.value,
          m.lotes.value,
          m.grupo.value,
          m.compradorId.value,
          aPesos(m.precio.value),
          m.datos.value ? pagoLotesVigentes(m.datos.value) : [],
        )
      : [],
  );

  return (
    <>
      <div class="grid items-end gap-x-4 gap-y-2.5 lg:grid-cols-[minmax(9rem,0.9fr)_minmax(14rem,1.4fr)_auto]">
        <Field id="r-precio" label="Precio de venta">
          <Input
            id="r-precio"
            inputMode="numeric"
            autocomplete="off"
            placeholder="$ 0"
            class="h-13 font-mono text-2xl font-bold"
            bind:value={m.precio}
            onKeyDown$={(e) => {
              if (e.key === "Enter" && !e.repeat) return acciones.adjudicar();
            }}
          />
        </Field>
        <Field id="r-comprador" label="Comprador">
          <DuenoBuscador
            id="r-comprador"
            abajo
            clientes={m.clientes.value}
            recientes={m.recientes.value}
            cuentas={{}}
            duenoId={m.compradorId.value}
            onElegir$={async (id, conEnter) => {
              m.compradorId.value = id;
              if (conEnter && aPesos(m.precio.value))
                return acciones.adjudicar();
              document.getElementById("r-precio")?.focus();
            }}
            onNuevo$={acciones.crearComprador}
            onEnter$={acciones.adjudicar}
          />
        </Field>
        <MartilloComision m={m} acciones={acciones} />
      </div>
      <MartilloRecientes m={m} />
      <p class="font-mono text-sm">{calculo.value}</p>
      <Avisos avisos={avisos.value} />
      <MartilloBotones m={m} acciones={acciones} />
    </>
  );
});
