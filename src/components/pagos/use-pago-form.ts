import { $, useStore, type Signal } from "@builder.io/qwik";
import type { LiquidacionState } from "~/components/liquidacion/use-liquidacion";
import type { Mensaje } from "~/components/page-columns/form-message";
import { registrarPago, type LotePagado } from "~/db/pagos";
import { aInputFecha, desdeInputFecha } from "~/lib/fechas";
import { aPesos, errorTxt, pesos } from "~/lib/textos";

export type PagoFormState = {
  sentido: "cobro" | "pago";
  fecha: string;
  monto: string;
  medio: "efectivo" | "transferencia" | "cheque" | "otro";
  referencia: string;
  acredita: string;
  aplica: "cuenta" | "lotes" | "cuota";
  lotes: number[];
  cuotaId: number | null;
};

const vacio = (sentido: PagoFormState["sentido"]): PagoFormState => ({
  sentido,
  fecha: aInputFecha(new Date()),
  monto: "",
  medio: "efectivo",
  referencia: "",
  acredita: "",
  aplica: "cuenta",
  lotes: [],
  cuotaId: null,
});

export const usePagoForm = (
  estado: LiquidacionState,
  mensaje: Signal<Mensaje | undefined>,
) => {
  const form = useStore<PagoFormState>(
    vacio((estado.liq.value?.neto ?? 0) < 0 ? "pago" : "cobro"),
  );

  const registrar = $(async () => {
    const liq = estado.liq.value;
    const remateId = estado.remateId.value;
    if (!liq?.liq || remateId === null) return;
    const error = (texto: string) => {
      mensaje.value = { tipo: "error", texto };
    };

    const aplica = form.sentido === "pago" ? "cuenta" : form.aplica;
    let monto = aPesos(form.monto);
    let cubre: LotePagado[] = [];
    if (aplica === "lotes") {
      cubre = liq.compras
        .filter((c) => c.resta > 0 && form.lotes.includes(c.numero))
        .map((c) => ({ remateId, loteNumero: c.numero, monto: c.resta }));
      if (cubre.length === 0) return error("Elegí al menos un lote impago.");
      monto = cubre.reduce((suma, l) => suma + l.monto, 0);
    }
    if (aplica === "cuota" && form.cuotaId === null)
      return error("Elegí la cuota que se paga.");
    if (!monto) return error("El monto tiene que ser mayor que 0.");
    if (!form.fecha) return error("Falta la fecha.");

    const liquidacionId = liq.liq.id;
    const pago = {
      liquidacionId,
      cuotaId: aplica === "cuota" ? form.cuotaId : null,
      sentido: form.sentido,
      fecha: desdeInputFecha(form.fecha),
      monto,
      medio: form.medio,
      referencia:
        form.medio === "efectivo" ? null : form.referencia.trim() || null,
      acredita:
        form.medio === "cheque" && form.acredita
          ? desdeInputFecha(form.acredita)
          : null,
    };
    const nombre = form.sentido === "cobro" ? "Cobro" : "Pago";
    try {
      await estado.hacer($(() => registrarPago(pago, cubre)));
    } catch (err) {
      return error(errorTxt(err));
    }
    Object.assign(form, vacio(form.sentido));
    mensaje.value = {
      tipo: "ok",
      texto: `${nombre} de ${pesos(monto)} registrado.`,
    };
  });

  return { form, registrar };
};
