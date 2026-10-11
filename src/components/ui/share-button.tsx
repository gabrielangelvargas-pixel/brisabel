"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/cn";

type ShareButtonProps = {
  title: string;
  text?: string;
  className?: string;
};

// Abre el menú nativo de compartir del dispositivo (Web Share API) con la
// página actual. Donde no existe (muchas computadoras), copia el enlace.
export function ShareButton({ title, text, className }: ShareButtonProps) {
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

  return (
    <button
      aria-live="polite"
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border border-brand/20 bg-surface/70 px-5 text-sm font-semibold text-brand transition hover:border-brand/40 hover:bg-surface",
        className,
      )}
      onClick={compartir}
      type="button"
    >
      {copiado ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copiado ? "¡Enlace copiado!" : "Compartir"}
    </button>
  );
}
