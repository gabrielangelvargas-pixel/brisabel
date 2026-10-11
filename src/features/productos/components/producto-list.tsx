import { Copy, EyeOff, ImageOff, Layers, Pencil, Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { eliminarProductoAction } from "@/features/productos/actions";
import { productoImagenUrl } from "@/features/productos/imagen-size";
import { formatPrecio } from "@/lib/format";

type ProductoFila = {
  id: number;
  sku: string;
  nombre: string;
  precioCosto: { toString(): string };
  precioVenta: { toString(): string };
  activo: boolean;
  destacado: boolean;
  imagen: string | null;
  variante: string | null;
  categoria: { nombre: string };
  modelo: { id: number; nombre: string } | null;
};

const iconButton =
  "inline-flex size-9 items-center justify-center rounded-md text-muted transition hover:bg-brand-soft hover:text-ink";

export function ProductoList({ productos }: { productos: ProductoFila[] }) {
  if (productos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-muted">
        No hay productos para mostrar.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
      {productos.map((producto) => {
        const imagenUrl = productoImagenUrl(producto.imagen);

        return (
          <li className="flex items-center gap-3 p-2 pr-2 sm:p-3" key={producto.id}>
            {/* Casilla del formulario "Agrupar seleccionados" (fuera de la lista). */}
            <input
              aria-label={`Seleccionar ${producto.nombre}`}
              className="size-4 shrink-0 accent-brand"
              form="agrupar-form"
              name="ids"
              type="checkbox"
              value={producto.id}
            />
            {imagenUrl ? (
              <Image
                alt=""
                className="size-14 shrink-0 rounded border border-line object-cover"
                height={112}
                src={imagenUrl}
                unoptimized
                width={112}
              />
            ) : (
              <span className="inline-flex size-14 shrink-0 items-center justify-center rounded border border-dashed border-line text-muted">
                <ImageOff className="size-4" />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-medium">
                <span className="truncate">{producto.nombre}</span>
                {producto.destacado ? <Sparkles aria-label="Destacado" className="size-4 shrink-0 text-gold" /> : null}
                {!producto.activo ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                    <EyeOff className="size-3" />
                    Oculto
                  </span>
                ) : null}
              </p>
              <p className="truncate text-xs text-muted">
                {producto.sku} · {producto.categoria.nombre}
              </p>
              {producto.modelo ? (
                <Link
                  className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand hover:bg-line"
                  href={`/admin/productos/modelos/${producto.modelo.id}`}
                  title="Editar modelo"
                >
                  <Layers className="size-3 shrink-0" />
                  <span className="truncate">
                    {producto.modelo.nombre} · {producto.variante}
                  </span>
                </Link>
              ) : null}
            </div>

            <div className="hidden shrink-0 text-right sm:block">
              <p className="font-semibold">{formatPrecio(producto.precioVenta.toString())}</p>
              <p className="text-xs text-muted">Costo {formatPrecio(producto.precioCosto.toString())}</p>
            </div>

            <div className="flex shrink-0 items-center">
              <Link aria-label={`Editar ${producto.nombre}`} className={iconButton} href={`/admin/productos/${producto.id}`} title="Editar">
                <Pencil className="size-4" />
              </Link>
              <Link
                aria-label={`Duplicar ${producto.nombre}`}
                className={iconButton}
                href={`/admin/productos/nuevo?duplicar=${producto.id}`}
                title="Duplicar"
              >
                <Copy className="size-4" />
              </Link>
              <form action={eliminarProductoAction}>
                <input name="id" type="hidden" value={producto.id} />
                <ConfirmSubmitButton
                  aria-label={`Eliminar ${producto.nombre}`}
                  className={`${iconButton} hover:bg-accent-soft hover:text-accent`}
                  message={`¿Eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`}
                  title="Eliminar"
                >
                  <Trash2 className="size-4" />
                </ConfirmSubmitButton>
              </form>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
