"use client";

import { CircleCheck, ShoppingBag, Store, Truck } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, TextareaField } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { calcularTotal, quitarDelCarrito, useCarrito, vaciarCarrito, type ItemCarrito } from "@/features/carrito/store";
import { DireccionSelector } from "@/features/direcciones/components/direccion-selector";
import type { DireccionGuardada } from "@/features/direcciones/queries";
import { crearPedidoAction, type PedidoState } from "@/features/pedidos/actions";
import { numeroPedido } from "@/features/pedidos/estados";
import { cn } from "@/lib/cn";
import { formatPrecio } from "@/lib/format";

const initialState: PedidoState = {};

// Finalizar compra: datos de contacto y entrega + resumen del carrito. El
// servidor recalcula precios y guarda el pedido; acá se vacía el carrito.
export function FinalizarCompra({
  nombreUsuario,
  direcciones,
}: {
  nombreUsuario: string;
  // Direcciones guardadas del usuario (para envío a domicilio).
  direcciones: DireccionGuardada[];
}) {
  const items = useCarrito();
  const [state, formAction, isPending] = useActionState(crearPedidoAction, initialState);

  useEffect(() => {
    if (state.pedido) vaciarCarrito();
    state.noDisponibles?.forEach(quitarDelCarrito);
  }, [state]);

  if (state.pedido) {
    return <Confirmacion id={state.pedido.id} total={state.pedido.total} />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
          <ShoppingBag className="size-8" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted">Agregá productos para finalizar una compra.</p>
        <Link
          className="mt-6 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
          href="/catalogo"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl font-semibold text-brand sm:text-3xl">Finalizar compra</h1>
      <p className="mt-1 text-sm text-muted">Completá tus datos y confirmá el pedido. Te contactamos para coordinar el pago y la entrega.</p>

      <form action={formAction} className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Solo id y cantidad: el servidor toma nombres y precios de la base. */}
        <input name="items" type="hidden" value={JSON.stringify(items.map(({ id, cantidad }) => ({ id, cantidad })))} />

        {/* Se remonta con los valores devueltos tras un error (React vacía el form). */}
        <DatosEntrega
          direcciones={direcciones}
          key={JSON.stringify(state.values ?? {})}
          nombreUsuario={nombreUsuario}
          state={state}
        />

        <Resumen error={state.error} isPending={isPending} items={items} />
      </form>
    </>
  );
}

function DatosEntrega({
  state,
  nombreUsuario,
  direcciones,
}: {
  state: PedidoState;
  nombreUsuario: string;
  direcciones: DireccionGuardada[];
}) {
  const values = state.values;
  const errors = state.fieldErrors ?? {};
  const [entrega, setEntrega] = useState(values?.entrega === "ENVIO" ? "ENVIO" : "RETIRO");

  return (
    <div className="grid gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="font-semibold">Tus datos</h2>
      <Field
        autoComplete="name"
        defaultValue={values?.nombre ?? nombreUsuario}
        error={errors.nombre}
        id="pedido-nombre"
        label="Nombre y apellido"
        name="nombre"
        required
      />

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">¿Cómo lo recibís?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              { valor: "RETIRO", label: "Retiro en el local", icon: Store },
              { valor: "ENVIO", label: "Envío a domicilio", icon: Truck },
            ] as const
          ).map(({ valor, label, icon: Icon }) => (
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-medium transition",
                entrega === valor ? "border-brand bg-brand-soft text-brand" : "border-line hover:border-brand/40",
              )}
              key={valor}
            >
              <input
                checked={entrega === valor}
                className="accent-brand"
                name="entrega"
                onChange={() => setEntrega(valor)}
                type="radio"
                value={valor}
              />
              <Icon className="size-5" />
              {label}
            </label>
          ))}
        </div>
        {errors.entrega ? <p className="text-xs text-accent">{errors.entrega}</p> : null}
      </fieldset>

      {entrega === "ENVIO" ? (
        <DireccionSelector direcciones={direcciones} errors={errors} values={values} />
      ) : (
        <Field
          autoComplete="tel"
          defaultValue={values?.telefono}
          error={errors.telefono}
          hint="Preferentemente con WhatsApp. Te avisamos cuando esté listo para retirar."
          id="pedido-telefono"
          inputMode="tel"
          label="Teléfono"
          name="telefono"
          required
          type="tel"
        />
      )}

      <TextareaField
        defaultValue={values?.notas}
        error={errors.notas}
        hint="Opcional. Ej.: es para regalo, horario para recibir."
        id="pedido-notas"
        label="Comentarios"
        maxLength={500}
        name="notas"
      />
    </div>
  );
}

function Resumen({ items, error, isPending }: { items: ItemCarrito[]; error?: string; isPending: boolean }) {
  return (
    <aside className="rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24">
      <h2 className="font-semibold">Tu pedido</h2>
      <ul className="mt-3 divide-y divide-line">
        {items.map((item) => (
          <li className="flex justify-between gap-3 py-2.5 text-sm" key={item.id}>
            <span className="min-w-0">
              <span className="line-clamp-2">
                {item.cantidad} × {item.nombre}
              </span>
              {item.variante ? <span className="block text-xs text-muted">{item.variante}</span> : null}
            </span>
            <span className="shrink-0 font-semibold tabular-nums">{formatPrecio(Number(item.precio) * item.cantidad)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
        <p className="font-semibold">Total</p>
        <p className="text-2xl font-bold text-brand tabular-nums">{formatPrecio(calcularTotal(items))}</p>
      </div>

      {error ? (
        <div className="mt-4">
          <FormAlert>{error}</FormAlert>
        </div>
      ) : null}

      <Button className="mt-4 h-12 w-full rounded-full text-base" disabled={isPending} type="submit">
        {isPending ? "Enviando pedido..." : "Confirmar pedido"}
      </Button>
      <Link className="mt-3 block text-center text-sm font-semibold text-accent underline-offset-4 hover:underline" href="/carrito">
        Volver al carrito
      </Link>
    </aside>
  );
}

function Confirmacion({ id, total }: { id: number; total: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
        <CircleCheck className="size-9" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold text-brand sm:text-3xl">¡Gracias por tu compra!</h1>
      <p className="mt-2 text-muted">
        Recibimos tu pedido <span className="font-semibold text-ink">{numeroPedido(id)}</span> por{" "}
        <span className="font-semibold text-ink">{formatPrecio(total)}</span>.
      </p>
      <p className="mt-1 max-w-md text-muted">Te vamos a contactar para coordinar el pago y la entrega.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
          href="/perfil"
        >
          Ver mis pedidos
        </Link>
        <Link
          className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold transition hover:bg-brand-soft"
          href="/catalogo"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
