import { component$ } from "@builder.io/qwik";
import type { LineaLiquidacion } from "~/lib/liquidacion-lineas";
import { pesos, porcentaje } from "~/lib/textos";

type ImpresaLineasProps = {
  titulo: string;
  signo: string;
  lineas: LineaLiquidacion[];
};

export const ImpresaLineas = component$<ImpresaLineasProps>((props) => {
  return (
    <section>
      <p class="mb-1.5 font-mono text-xs tracking-widest uppercase">
        {props.titulo}
      </p>
      {props.lineas.map((l) => (
        <div
          key={l.numero}
          class="border-sidebar-border grid grid-cols-[3rem_minmax(0,1fr)_6rem_4rem_7rem] gap-x-2.5 border-b text-sm"
        >
          <span class="text-right font-mono font-bold">{l.numero}</span>
          <span class="truncate">{l.articulo}</span>
          <span class="text-right font-mono">{pesos(l.precio)}</span>
          <span class="text-right font-mono">
            {l.comision ? `${props.signo}${porcentaje(l.comision)}` : "—"}
          </span>
          <span class="text-right font-mono font-bold">{pesos(l.total)}</span>
        </div>
      ))}
    </section>
  );
});
