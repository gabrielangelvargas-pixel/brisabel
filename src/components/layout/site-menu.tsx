"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useRef } from "react";

import { SiteLogo } from "@/components/layout/site-logo";
import { InstalarApp } from "@/components/pwa/instalar-app";
import { mainNavigation } from "@/config/navigation";
import { cn } from "@/lib/cn";

// Menú lateral izquierdo. Usa <dialog> nativo: trae foco atrapado,
// cierre con Escape y fondo inerte sin código extra.
export function SiteMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        aria-label="Abrir menú"
        className="inline-flex size-10 items-center justify-center rounded-md text-ink transition hover:bg-brand-soft"
        onClick={open}
        type="button"
      >
        <Menu className="size-6" />
      </button>

      <dialog
        aria-label="Menú principal"
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-80 max-w-[85vw] -translate-x-full bg-surface p-0 text-ink shadow-xl transition-[translate,display,overlay] transition-discrete duration-300 ease-out backdrop:bg-ink/40 open:translate-x-0 starting:open:-translate-x-full"
        onClick={(event) => {
          // Un click fuera del panel cae sobre el propio <dialog> (el backdrop).
          if (event.target === event.currentTarget) close();
        }}
        ref={dialogRef}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between border-b border-line px-4">
            <SiteLogo className="h-16" onClick={close} />
            <button
              aria-label="Cerrar menú"
              className="inline-flex size-10 items-center justify-center rounded-md transition hover:bg-brand-soft"
              onClick={close}
              type="button"
            >
              <X className="size-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            {/* La URL actual solo se conoce en el request (rutas dinámicas):
                mientras tanto se muestran los enlaces sin resaltar. */}
            <Suspense fallback={<MenuLinks onNavigate={close} />}>
              <ActiveMenuLinks onNavigate={close} />
            </Suspense>
          </nav>

          <InstalarApp />
        </div>
      </dialog>
    </>
  );
}

function ActiveMenuLinks({ onNavigate }: { onNavigate: () => void }) {
  return <MenuLinks activeHref={usePathname()} onNavigate={onNavigate} />;
}

function MenuLinks({ activeHref, onNavigate }: { activeHref?: string; onNavigate: () => void }) {
  return (
    <ul className="grid gap-1">
      {mainNavigation.map((item) => {
        const isActive = activeHref === item.href;

        return (
          <li key={item.href}>
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "block rounded-md px-3 py-2.5 text-base font-medium transition hover:bg-brand-soft",
                isActive && "bg-brand-soft text-brand",
              )}
              href={item.href}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
