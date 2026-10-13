import { Heart } from "lucide-react";
import Link from "next/link";

import { siteConfig } from "@/config/site";

const footerLinks = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Carrito", href: "/carrito" },
  { label: "Ingresar o crear cuenta", href: "/ingresar" },
  { label: "Mi cuenta", href: "/perfil" },
];

// Pie compacto sobre fondo verde oscuro. El logo (verde sobre transparente) no
// se lee en oscuro: se usa el nombre en la tipografía de la marca.
export function SiteFooter() {
  return (
    <footer className="bg-brand-strong text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            aria-label={`${siteConfig.name} - Inicio`}
            className="inline-flex items-center gap-1.5 font-display text-2xl font-semibold"
            href="/"
          >
            {siteConfig.name}
            <Heart className="size-4 fill-heart text-heart" />
          </Link>
          <p className="mt-1 text-sm text-white/65">{siteConfig.description}</p>
        </div>

        <nav aria-label="Enlaces del sitio">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:flex sm:flex-wrap sm:gap-x-8">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link className="text-sm text-white/85 transition hover:text-heart" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-7xl px-5 py-4 text-xs text-white/50">
          {siteConfig.name} · {siteConfig.tagline}
        </p>
      </div>
    </footer>
  );
}
