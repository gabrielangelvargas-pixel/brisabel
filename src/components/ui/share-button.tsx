"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/cn";

type ShareButtonProps = {
  title: string;
  text?: string;
  // "pill": ícono + texto. "icon": solo el ícono en un círculo.
  variant?: "pill" | "icon";
  className?: string;
};

const variants = {
  pill: "h-11 gap-2 rounded-full border border-brand/20 bg-surface/70 px-5 text-sm font-semibold hover:border-brand/40 hover:bg-surface",
  icon: "size-11 justify-center rounded-full bg-surface/95 shadow-lg ring-1 ring-black/5 backdrop-blur hover:bg-surface",
};

// Abre el menú nativo de compartir del dispositivo (Web Share API) con la
// página actual. Donde no existe (muchas computadoras), copia el enlace.
export function ShareButton({ title, text, variant = "pill", className }: ShareButtonProps) {
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // El usuario cerró el menú sin compartir: no es un error.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt("Copiá el enlace:", url);
    }
  }

  const Icono = copiado ? Check : Share2;
  const etiqueta = copiado ? "¡Enlace copiado!" : "Compartir";

  return (
    <button
      aria-label={variant === "icon" ? etiqueta : undefined}
      aria-live="polite"
      className={cn("inline-flex items-center text-brand transition", variants[variant], className)}
      onClick={compartir}
      title={variant === "icon" ? etiqueta : undefined}
      type="button"
    >
      <Icono className={variant === "icon" ? "size-5" : "size-4"} />
      {variant === "pill" ? etiqueta : null}
    </button>
  );
}
