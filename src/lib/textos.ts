/** "13" -> "013", as lot numbers read on a catalog. */
export const numeroLote = (n: number) => String(n).padStart(3, "0");

/** 150000 -> "$150.000". */
export const pesos = (n: number) => `$${n.toLocaleString("es-AR")}`;

export const lotesTxt = (n: number) => (n === 1 ? "1 lote" : `${n} lotes`);

export const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");

export const errorTxt = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

/** For comparing names: ignores case, accents and repeated spaces. */
export const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** A client's text as the database stores it. */
export const textoCliente = (texto: string) =>
  texto.trim().toLowerCase().replace(/\s+/g, " ");

/** "ana  ruiz" -> "Ana Ruiz": how the app shows a client's stored name. */
export const titulo = (texto: string) =>
  texto
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
