import { ChevronDown, ChevronUp, EyeOff, ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { eliminarCategoriaAction, moverCategoriaAction } from "@/features/categorias/actions";
import { IMAGEN_ALTO, IMAGEN_ANCHO, IMAGEN_PROPORCION } from "@/features/categorias/imagen-size";
import { categoriaImagenUrl, MAX_NIVEL } from "@/features/categorias/tree";
import { cn } from "@/lib/cn";

type CategoriaFila = {
  id: number;
  nombre: string;
  slug: string;
  imagen: string | null;
  activa: boolean;
  nivel: number;
  parentId: number | null;
  _count: { hijas: number; productos: number };
};

const iconButton =
  "inline-flex size-9 items-center justify-center rounded-md text-muted transition hover:bg-brand-soft hover:text-ink disabled:pointer-events-none disabled:opacity-30";

const nivelLabel = ["Categoría", "Subcategoría", "Sub-subcategoría"];

export function CategoriaList({ categorias }: { categorias: CategoriaFila[] }) {
  if (categorias.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-muted">
        Todavía no hay categorías. Creá la primera con el botón &quot;Nueva categoría&quot;.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
      {categorias.map((categoria, index) => {
        const hermanas = categorias.filter((c) => c.parentId === categoria.parentId);
        const posicion = hermanas.findIndex((c) => c.id === categoria.id);
        const { hijas, productos } = categoria._count;
        const puedeTenerHijas = categoria.nivel < MAX_NIVEL && productos === 0;
        const puedeEliminar = hijas === 0 && productos === 0;
        const imagenUrl = categoriaImagenUrl(categoria.imagen);

        return (
          <li
            className={cn("flex items-center gap-2 py-2 pr-2", index % 2 === 1 && "bg-canvas/50")}
            key={categoria.id}
            style={{ paddingLeft: `${0.75 + categoria.nivel * 1.5}rem` }}
          >
            {imagenUrl ? (
              <Image
                alt=""
                className="w-16 shrink-0 rounded border border-line object-cover"
                height={IMAGEN_ALTO}
                src={imagenUrl}
                style={IMAGEN_PROPORCION}
                unoptimized
                width={IMAGEN_ANCHO}
              />
            ) : (
              <span
                className="inline-flex w-16 shrink-0 items-center justify-center rounded border border-dashed border-line text-muted"
                style={IMAGEN_PROPORCION}
                title="Sin imagen"
              >
                <ImageOff className="size-4" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate font-medium">
                {categoria.nivel > 0 ? <span className="text-muted">›</span> : null}
                <span className="truncate">{categoria.nombre}</span>
                {!categoria.activa ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                    <EyeOff className="size-3" />
                    Oculta
                  </span>
                ) : null}
              </p>
              <p className="truncate text-xs text-muted">
                {nivelLabel[categoria.nivel]} · /{categoria.slug}
                {productos > 0 ? ` · ${productos} ${productos === 1 ? "producto" : "productos"}` : ""}
              </p>
            </div>

            <div className="flex shrink-0 items-center">
              <form action={moverCategoriaAction}>
                <input name="id" type="hidden" value={categoria.id} />
                <input name="direccion" type="hidden" value="arriba" />
                <button aria-label={`Subir ${categoria.nombre}`} className={iconButton} disabled={posicion === 0} type="submit">
                  <ChevronUp className="size-4" />
                </button>
              </form>
              <form action={moverCategoriaAction}>
                <input name="id" type="hidden" value={categoria.id} />
                <input name="direccion" type="hidden" value="abajo" />
                <button
                  aria-label={`Bajar ${categoria.nombre}`}
                  className={iconButton}
                  disabled={posicion === hermanas.length - 1}
                  type="submit"
                >
                  <ChevronDown className="size-4" />
                </button>
              </form>
              {puedeTenerHijas ? (
                <Link
                  aria-label={`Agregar subcategoría en ${categoria.nombre}`}
                  className={iconButton}
                  href={`/admin/categorias/nueva?padre=${categoria.id}`}
                  title="Agregar subcategoría"
                >
                  <Plus className="size-4" />
                </Link>
              ) : (
                <span aria-hidden className="size-9" />
              )}
              <Link
                aria-label={`Editar ${categoria.nombre}`}
                className={iconButton}
                href={`/admin/categorias/${categoria.id}`}
                title="Editar"
              >
                <Pencil className="size-4" />
              </Link>
              <form action={eliminarCategoriaAction}>
                <input name="id" type="hidden" value={categoria.id} />
                <ConfirmSubmitButton
                  aria-label={`Eliminar ${categoria.nombre}`}
                  className={cn(iconButton, "hover:bg-accent-soft hover:text-accent")}
                  disabled={!puedeEliminar}
                  message={`¿Eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`}
                  title={puedeEliminar ? "Eliminar" : "Tiene subcategorías o productos: no se puede eliminar"}
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
