import { EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { eliminarPortadaAction } from "@/features/portada/actions";
import { PORTADA_ALTO, PORTADA_ANCHO, portadaImagenUrl } from "@/features/portada/imagen-size";
import { getPortadasAdmin } from "@/features/portada/queries";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Portada" };

const mensajesOk: Record<string, string> = {
  creada: "Foto agregada a la portada.",
  actualizada: "Cambios guardados.",
  eliminada: "Foto eliminada.",
};

export default function AdminPortadaPage({ searchParams }: PageProps<"/admin/portada">) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
      <Link className="text-sm font-medium text-muted hover:text-ink" href="/admin">
        ← Panel
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Portada</h1>
          <p className="mt-1 text-sm text-muted">
            Fotos del slider de la página de inicio: momentos de regalo en cada celebración.
          </p>
        </div>
        <Link
          className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
          href="/admin/portada/nueva"
        >
          <Plus className="size-4" />
          Nueva foto
        </Link>
      </div>

      <Suspense fallback={<p className="mt-8 text-muted">Cargando...</p>}>
        <Listado searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Listado({ searchParams }: Pick<PageProps<"/admin/portada">, "searchParams">) {
  await requireAdmin();

  const [portadas, { ok }] = await Promise.all([getPortadasAdmin(), searchParams]);
  const mensaje = typeof ok === "string" ? mensajesOk[ok] : undefined;

  return (
    <div className="mt-8 grid gap-4">
      {mensaje ? (
        <p className="rounded-md border border-leaf/40 bg-brand-soft px-3 py-2 text-sm text-brand" role="status">
          {mensaje}
        </p>
      ) : null}

      {portadas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-muted">
          Todavía no hay fotos. Mientras tanto, la portada muestra la foto de siempre.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portadas.map((portada) => (
            <li className="overflow-hidden rounded-lg border border-line bg-surface" key={portada.id}>
              <div className="relative">
                <Image
                  alt={portada.ocasion}
                  className="w-full object-cover"
                  height={PORTADA_ALTO}
                  src={portadaImagenUrl(portada.imagen)}
                  style={{ aspectRatio: `${PORTADA_ANCHO} / ${PORTADA_ALTO}` }}
                  unoptimized
                  width={PORTADA_ANCHO}
                />
                {!portada.activa ? (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2 py-0.5 text-xs font-semibold text-white">
                    <EyeOff className="size-3" />
                    Oculta
                  </span>
                ) : null}
              </div>
              <div className="flex items-start gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {portada.ocasion}
                    <span className="ml-2 text-xs font-normal text-muted">Orden {portada.orden}</span>
                  </p>
                  {portada.frase ? <p className="truncate text-sm text-muted">{portada.frase}</p> : null}
                  {portada.enlace ? <p className="truncate text-xs text-accent">{portada.enlace}</p> : null}
                </div>
                <Link
                  aria-label={`Editar ${portada.ocasion}`}
                  className="inline-flex size-9 items-center justify-center rounded-md text-muted transition hover:bg-brand-soft hover:text-brand"
                  href={`/admin/portada/${portada.id}`}
                >
                  <Pencil className="size-4" />
                </Link>
                <form action={eliminarPortadaAction}>
                  <input name="id" type="hidden" value={portada.id} />
                  <ConfirmSubmitButton
                    aria-label={`Eliminar ${portada.ocasion}`}
                    className="inline-flex size-9 items-center justify-center rounded-md text-muted transition hover:bg-accent-soft hover:text-accent"
                    message={`¿Eliminar la foto de ${portada.ocasion}?`}
                  >
                    <Trash2 className="size-4" />
                  </ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
