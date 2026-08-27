"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, Home, ShoppingCart, UserRound } from "lucide-react";

const navigationItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/catalogo", label: "Catalogo", icon: Grid2X2 },
  { href: "/perfil", label: "Perfil", icon: UserRound },
  { href: "/carrito", label: "Carrito", icon: ShoppingCart },
];

function isItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/catalogo") {
    return pathname === "/catalogo" || pathname.startsWith("/categorias");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNavigation() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      aria-label="Navegacion principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e1d8cc] bg-[#fffaf6]/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 shadow-[0_-12px_30px_rgba(31,35,32,0.08)] backdrop-blur"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(pathname, item.href);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 text-xs font-semibold transition ${
                active
                  ? "bg-[#7f4f3a] text-white"
                  : "text-[#6a625a] hover:bg-[#f2e4db] hover:text-[#7f4f3a]"
              }`}
              href={item.href}
              key={item.href}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
