import { $, useSignal, useStore, type Signal } from "@builder.io/qwik";
import type { LiquidacionState } from "~/components/liquidacion/use-liquidacion";
import type { Mensaje } from "~/components/page-columns/form-message";
import { registrarPago, type LotePagado } from "~/db/pagos";
import { desdeInputFecha } from "~/lib/fechas";
import { aPesos, errorTxt, pesos } from "~/lib/textos";
import { useFotoPago, useGuardarPago } from "~/store";
import { vacio, type PagoFormState } from "./pago-form-state";
import { useMontoSugerido } from "./use-monto-sugerido";

export type { PagoFormState };

export const usePagoForm = (
  estado: LiquidacionState,
  mensaje: Signal<Mensaje | undefined>,
) => {
  const liqId = estado.liq.value?.liq?.id ?? 0;
  const foto = useFotoPago();
  const propia = foto?.liqId === liqId ? foto : undefined;
  // Without a draft, the direction comes from the database: see `useMontoSugerido`.
  const form = useStore<PagoFormState>(propia?.form ?? vacio("cobro"));
  /** The balance and direction the amount was last suggested for. */
  const sugerido = useSignal(propia?.sugerido ?? "");
  useGuardarPago({ liqId, sugerido, form });

  useMontoSugerido(estado, form, sugerido, !propia);

  const registrar = $(async () => {
    const remateId = estado.remateId.value;
    const error = (texto: string) => {
      mensaje.value = { tipo: "error", texto };
    };
    // What's saved is worked out from the database, not the screen.
    let vigente;
    try {
      vigente = await estado.vigente();
    } catch (err) {
      return error(errorTxt(err));
    }
    const liq = vigente?.liq;
    if (!liq?.liq || remateId === null) return;

    // `PagoAplica` keeps it to an option that exists ("A cuenta" for a payment).
    const aplica = form.aplica;
    let monto = aPesos(form.monto);
    let cubre: LotePagado[] = [];
    if (aplica === "lotes") {
      cubre = liq.compras
        .filter((c) => c.resta > 0 && form.lotes.includes(c.numero))
        .map((c) => ({ remateId, loteNumero: c.numero, monto: c.resta }));
      if (cubre.length === 0) return error("Elegí al menos un lote impago.");
      if (cubre.length < form.lotes.length)
        return error("Uno de los lotes elegidos ya está pago.");
      monto = cubre.reduce((suma, l) => suma + l.monto, 0);
    }
    if (aplica === "cuota" && form.cuotaId === null)
      return error("Elegí la cuota que se paga.");
    const cuota = vigente?.cuotas.find((c) => c.cuota.id === form.cuotaId);
    if (aplica === "cuota" && !cuota?.resta)
      return error("La cuota elegida ya está paga.");
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
    // The amount comes back as what's left, read again.
    sugerido.value = "";
    mensaje.value = {
      tipo: "ok",
      texto: `${nombre} de ${pesos(monto)} registrado.`,
    };
  });

  return { form, registrar };
};
