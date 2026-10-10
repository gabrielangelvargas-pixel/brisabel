import { LogIn, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth/session";

const iconLinkClass =
  "inline-flex size-10 items-center justify-center rounded-md text-ink transition hover:bg-brand-soft";

export function HeaderActions() {
  return (
    <div className="ml-auto flex items-center gap-1">
      <Link aria-label="Carrito" className={iconLinkClass} href="/carrito">
        <ShoppingBag className="size-6" />
      </Link>

      {/* La sesión se lee por request: el resto del navbar queda estático. */}
      <Suspense fallback={<span aria-hidden className="size-10" />}>
        <AccountLink />
      </Suspense>
    </div>
  );
}

async function AccountLink() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link aria-label="Ingresar" className={iconLinkClass} href="/ingresar">
        <LogIn className="size-6" />
      </Link>
    );
  }

  return (
    <Link
      aria-label={`Mi cuenta (${user.nombre})`}
      className={iconLinkClass}
      href="/admin"
      title={user.nombre}
    >
      <UserRound className="size-6" />
    </Link>
  );
}
