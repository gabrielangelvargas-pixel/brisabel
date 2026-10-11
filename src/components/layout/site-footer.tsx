import { Heart } from "lucide-react";
import Link from "next/link";

import { SiteLogo } from "@/components/layout/site-logo";
import { siteConfig } from "@/config/site";

const footerLinks = [
  {
    titulo: "Tienda",
    links: [
      { label: "Catálogo", href: "/catalogo" },
      { label: "Carrito", href: "/carrito" },
    ],
  },
  {
    titulo: "Tu cuenta",
    links: [
      { label: "Ingresar o crear cuenta", href: "/ingresar" },
      { label: "Mi cuenta", href: "/perfil" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <SiteLogo className="h-20" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">{siteConfig.description}</p>
        </div>

        {footerLinks.map((group) => (
          <nav aria-label={group.titulo} key={group.titulo}>
            <h2 className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">{group.titulo}</h2>
            <ul className="mt-4 grid gap-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link className="text-sm text-ink transition hover:text-accent" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <p className="mx-auto flex w-full max-w-7xl items-center gap-1.5 px-5 py-5 text-xs text-muted">
          {siteConfig.name} · {siteConfig.tagline}
          <Heart className="size-3 fill-heart text-heart" />
        </p>
      </div>
    </footer>
  );
}
