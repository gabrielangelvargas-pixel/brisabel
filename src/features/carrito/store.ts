"use client";

import { useSyncExternalStore } from "react";

// Carrito del visitante, guardado en el navegador (localStorage): funciona sin
// cuenta y se comparte entre pestañas. Guarda una foto de los datos al agregar;
// al finalizar la compra los precios se vuelven a validar en el servidor.

export type ItemCarrito = {
  id: number;
  sku: string;
  nombre: string;
  // "Color: Negro". null en productos sin variantes.
  variante: string | null;
  precio: string;
  imagen: string | null;
  cantidad: number;
};

const CLAVE = "brisabel-carrito";
const MAX_CANTIDAD = 99;
const VACIO: ItemCarrito[] = [];

let items: ItemCarrito[] | null = null;
const listeners = new Set<() => void>();

function leer(): ItemCarrito[] {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
    return Array.isArray(guardado) ? guardado.filter(esItemValido) : VACIO;
  } catch {
    return VACIO;
  }
}

function esItemValido(item: unknown): item is ItemCarrito {
  const i = item as ItemCarrito;
  return typeof i?.id === "number" && typeof i.nombre === "string" && typeof i.precio === "string" && i.cantidad > 0;
}

function guardar(nuevos: ItemCarrito[]) {
  items = nuevos;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevos));
  } catch {
    // Sin almacenamiento (modo privado estricto): el carrito vive en memoria.
  }
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  items ??= leer();
  return items;
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Cambios hechos en otra pestaña.
  const onStorage = (event: StorageEvent) => {
    if (event.key === CLAVE) {
      items = leer();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCarrito() {
  return useSyncExternalStore(subscribe, getSnapshot, () => VACIO);
}

export function contarUnidades(lista: ItemCarrito[]) {
  return lista.reduce((total, item) => total + item.cantidad, 0);
}

export function calcularTotal(lista: ItemCarrito[]) {
  return lista.reduce((total, item) => total + Number(item.precio) * item.cantidad, 0);
}

// Si el producto ya está, suma una unidad (y actualiza sus datos).
export function agregarAlCarrito(item: Omit<ItemCarrito, "cantidad">) {
  const actuales = getSnapshot();
  const existente = actuales.find((i) => i.id === item.id);

  guardar(
    existente
      ? actuales.map((i) => (i.id === item.id ? { ...item, cantidad: Math.min(i.cantidad + 1, MAX_CANTIDAD) } : i))
      : [...actuales, { ...item, cantidad: 1 }],
  );
}

export function cambiarCantidad(id: number, cantidad: number) {
  if (cantidad < 1) {
    quitarDelCarrito(id);
    return;
  }

  guardar(getSnapshot().map((i) => (i.id === id ? { ...i, cantidad: Math.min(cantidad, MAX_CANTIDAD) } : i)));
}

export function quitarDelCarrito(id: number) {
  guardar(getSnapshot().filter((i) => i.id !== id));
}
