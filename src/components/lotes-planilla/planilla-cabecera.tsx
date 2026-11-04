import { component$ } from "@builder.io/qwik";

const COLUMNAS = [
  {
    titulo: "N°",
    ancho: "w-15",
    clase: "text-right border-r-2 border-double border-r-sidebar-primary",
  },
  { titulo: "Artículo", ancho: "" },
  { titulo: "Dueño", ancho: "w-1/5" },
  { titulo: "Base", ancho: "w-32", clase: "text-right" },
  { titulo: "Funciona", ancho: "w-24" },
  { titulo: "Marca", ancho: "w-1/6" },
];

export const CANTIDAD_COLUMNAS = COLUMNAS.length;

export const PlanillaCabecera = component$(() => {
  return (
    <>
      <colgroup>
        {COLUMNAS.map(({ titulo, ancho }) => (
          <col key={titulo} class={ancho} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {COLUMNAS.map(({ titulo, clase }) => (
            <th
              key={titulo}
              scope="col"
              class={[
                "bg-muted text-muted-foreground border-r-sidebar-border border-b-foreground sticky top-0 z-2 h-9 truncate border-r-1 border-b-3 border-double px-2.5 text-left font-mono text-xs font-normal tracking-wider uppercase last:border-r-0",
                clase,
              ]}
            >
              {titulo}
            </th>
          ))}
        </tr>
      </thead>
    </>
  );
});
