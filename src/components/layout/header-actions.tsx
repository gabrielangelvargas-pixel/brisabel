import { LayoutDashboard, LogIn, UserRound } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { CarritoIcono } from "@/features/carrito/components/carrito-icono";
import { ROLES } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";

const iconLinkClass =
  "inline-flex size-10 items-center justify-center rounded-md text-ink transition hover:bg-brand-soft";

export function HeaderActions() {
  return (
    <div className="ml-auto flex items-center gap-1">
      <CarritoIcono className={iconLinkClass} />

      {/* La sesión se lee por request: el resto del navbar queda estático. */}
      <Suspense fallback={<span aria-hidden className="size-10" />}>
        <AccountLinks />
      </Suspense>
    </div>
  );
}

// Sin sesión: ingresar. Con sesión: perfil, y el admin además el panel.
async function AccountLinks() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link aria-label="Ingresar" className={iconLinkClass} href="/ingresar">
        <LogIn className="size-6" />
      </Link>
    );
  }

  return (
    <>
      <Link
        aria-label={`Mi cuenta (${user.nombre})`}
        className={iconLinkClass}
        href="/perfil"
        title={user.nombre}
      >
        <UserRound className="size-6" />
      </Link>
      {user.rol === ROLES.ADMIN ? (
        <Link aria-label="Panel de administración" className={iconLinkClass} href="/admin" title="Panel">
          <LayoutDashboard className="size-6" />
        </Link>
      ) : null}
    </>
  );
}
