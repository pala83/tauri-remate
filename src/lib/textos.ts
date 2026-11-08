/** "13" -> "013", as lot numbers read on a catalog. */
export const numeroLote = (n: number) => String(n).padStart(3, "0");

/** 150000 -> "$ 150.000". The sign is left to the text around it. */
export const pesos = (n: number) =>
  `$ ${String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

/** What a typed amount is worth: "$ 1.500" -> 1500; nothing typed -> 0. */
export const aPesos = (texto: string) =>
  Number(texto.split(",")[0].replace(/\D/g, ""));

/** 1000 -> "10%", 250 -> "2,5%": a commission as it's stored, in hundredths. */
export const porcentaje = (comision: number) => `${campoComision(comision)}%`;

/** 1000 -> "10", 250 -> "2,5": a stored commission, as it's typed. */
export const campoComision = (comision: number) =>
  String(comision / 100).replace(".", ",");

/** "2,5" -> 250. Null unless it's a percentage from 0 to 100, with up to two decimals. */
export const aComision = (texto: string) => {
  const limpio = texto.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return null;
  const comision = Math.round(Number(limpio) * 100);
  return comision <= 10000 ? comision : null;
};

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
