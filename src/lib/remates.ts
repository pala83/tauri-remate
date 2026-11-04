import { desdeInputFecha } from "./fechas";
import { esLinkDeMaps } from "./lugar";

export type RemateCampos = { nombre: string; fecha: string; lugar: string };

/** What's wrong with the form's values, if anything. */
export const errorRemate = ({ nombre, fecha, lugar }: RemateCampos) => {
  if (!nombre.trim()) return "Falta el nombre identificativo.";
  if (!fecha) return "Falta la fecha del remate.";
  const link = lugar.trim();
  if (link && !esLinkDeMaps(link)) return "Pegá el link completo de Google Maps.";
};

/** The form's values as the database stores them. */
export const valoresRemate = ({ nombre, fecha, lugar }: RemateCampos) => ({
  nombre: nombre.trim(),
  fecha: desdeInputFecha(fecha),
  // `href` is the form the permission in `capabilities/default.json` compares.
  lugar: lugar.trim() ? new URL(lugar.trim()).href : null,
});
