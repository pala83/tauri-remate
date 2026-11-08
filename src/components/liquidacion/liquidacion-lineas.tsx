import { component$ } from "@builder.io/qwik";
import type { LineaLiquidacion } from "~/lib/liquidacion-lineas";
import { pesos, porcentaje, titulo } from "~/lib/textos";

type LineasProps = {
  titulo: string;
  nota: string;
  vacio: string;
  subtotalTexto: string;
  subtotal: number;
  lineas: LineaLiquidacion[];
  /** "+" for purchases, "−" for sales. */
  signo: string;
  esCompra?: boolean;
};

const estadoDe = (l: LineaLiquidacion) => {
  if (l.resta === 0) return { texto: "pagado", clase: "text-sidebar-accent" };
  if (l.pagado > 0)
    return { texto: `pagó ${pesos(l.pagado)}`, clase: "text-muted-foreground" };
  return { texto: "impago", clase: "text-alert" };
};

const CELDA = "border-sidebar-border h-10 border-b px-1.5";
const MONO = `${CELDA} text-right font-mono text-sm`;

export const LiquidacionLineas = component$<LineasProps>((props) => {
  return (
    <section aria-label={props.titulo} class="flex flex-col">
      <div class="flex flex-wrap items-baseline justify-between gap-x-3 border-b pb-1.5">
        <h4 class="font-mono text-sm tracking-wider uppercase">
          {props.titulo}
        </h4>
        <span class="text-muted-foreground font-mono text-xs">
          {props.nota}
        </span>
      </div>
      {props.lineas.length > 0 && (
        <div class="overflow-x-auto">
          <table class="w-full min-w-150 table-fixed border-collapse">
            <tbody>
              {props.lineas.map((l) => (
                <tr key={l.numero}>
                  <td class={`${CELDA} w-12 text-right font-serif text-lg`}>
                    {l.numero}
                  </td>
                  <td class={`${CELDA} truncate`} title={l.articulo}>
                    {l.articulo}
                  </td>
                  <td class={`${MONO} w-24`}>{pesos(l.precio)}</td>
                  <td class={`${MONO} text-muted-foreground w-16`}>
                    {l.comision
                      ? `${props.signo}${porcentaje(l.comision)}`
                      : "sin com."}
                  </td>
                  <td class={`${MONO} w-26 font-bold`}>{pesos(l.total)}</td>
                  {props.esCompra ? (
                    <td class={`${MONO} w-28 text-xs ${estadoDe(l).clase}`}>
                      {estadoDe(l).texto}
                    </td>
                  ) : (
                    <td
                      class={`${MONO} text-muted-foreground w-28 truncate text-xs`}
                      title={titulo(l.otro ?? "")}
                    >
                      a {titulo(l.otro ?? "")}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {props.lineas.length === 0 && (
        <p class="text-muted-foreground mt-2.5 italic">{props.vacio}</p>
      )}
      <p class="mt-2 flex justify-end gap-4 font-mono text-sm">
        <span class="text-muted-foreground">{props.subtotalTexto}</span>
        <strong>{pesos(props.subtotal)}</strong>
      </p>
    </section>
  );
});
