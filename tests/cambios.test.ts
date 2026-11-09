/** A draft put back over the database: only what the user typed comes from it. */
import { expect, test } from "bun:test";
import { conCambios } from "../src/lib/cambios";

const base = { nombre: "mesa", precio: "1000", comprador: "3" };

test("sin borrador, todo viene de la base", () => {
  const fresco = { ...base, precio: "2000" };
  expect(conCambios(fresco)).toEqual({ form: fresco, base: fresco });
});

test("lo que el usuario no tocó sale de la base, aunque haya cambiado", () => {
  const fresco = { nombre: "mesa", precio: "2000", comprador: "4" };
  const form = { ...base, nombre: "mesa de roble" };
  expect(conCambios(fresco, { base, form }).form).toEqual({
    nombre: "mesa de roble",
    precio: "2000",
    comprador: "4",
  });
});

test("lo escrito sigue contando como cambio después de volver", () => {
  const fresco = { ...base };
  const form = { ...base, precio: "1500" };
  const vuelta = conCambios(fresco, { base, form });
  expect(vuelta.form.precio).toBe("1500");
  expect(conCambios(fresco, vuelta).form.precio).toBe("1500");
});

test("compara listas por su contenido", () => {
  const b = { grupo: [2, 3] };
  const fresco = { grupo: [2] };
  expect(conCambios(fresco, { base: b, form: { grupo: [2, 3] } }).form).toEqual(
    fresco,
  );
});
