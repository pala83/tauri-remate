const corta = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});
const larga = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const MS_POR_DIA = 86_400_000;

/** "sáb 14 nov 2026" */
export const fechaCorta = (fecha: Date) =>
  corta.format(fecha).replace(/[,.]/g, "").replace(/ de /g, " ");

/** "Sábado 14 de noviembre de 2026" */
export const fechaLarga = (fecha: Date) => {
  const texto = larga.format(fecha).replace(",", "");
  return texto[0].toUpperCase() + texto.slice(1);
};

/** Parses the value of an `<input type="date">` as local midnight. */
export const desdeInputFecha = (valor: string) => new Date(`${valor}T00:00:00`);

/** The value for an `<input type="date">`, using the local day: `toISOString` could shift it. */
export const aInputFecha = (fecha: Date) => {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
};

const diasHasta = (fecha: Date) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dia = new Date(fecha);
  dia.setHours(0, 0, 0, 0);
  return Math.round((dia.getTime() - hoy.getTime()) / MS_POR_DIA);
};

export const esRealizada = (fecha: Date) => diasHasta(fecha) < 0;

export const estadoCorto = (fecha: Date) => {
  const dias = diasHasta(fecha);
  return dias > 0 ? "Próxima" : dias === 0 ? "Hoy" : "Realizada";
};

export const estadoLargo = (fecha: Date) => {
  const dias = diasHasta(fecha);
  if (dias > 1) return `Próxima · faltan ${dias} días`;
  if (dias === 1) return "Próxima · es mañana";
  if (dias === 0) return "Es hoy";
  return `Realizada hace ${-dias} ${dias === -1 ? "día" : "días"}`;
};
