const igual = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * A draft put back over what the database says now. Only the fields the user
 * changed from `base` (what the form had when it was filled) keep the draft's
 * value; the rest come `fresco` from the database, so nothing that was read
 * before goes back into it. `base` is what to compare with from now on.
 */
export const conCambios = <T extends object>(
  fresco: T,
  borrador?: { base: T; form: T },
): { form: T; base: T } => {
  if (!borrador) return { form: fresco, base: fresco };
  const form = { ...fresco };
  const base = { ...fresco };
  for (const k of Object.keys(fresco) as (keyof T)[])
    if (!igual(borrador.form[k], borrador.base[k])) {
      form[k] = borrador.form[k];
      base[k] = borrador.base[k];
    }
  return { form, base };
};
