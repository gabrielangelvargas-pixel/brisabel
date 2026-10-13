"use client";

import { useState, type KeyboardEvent } from "react";

import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { cn } from "@/lib/cn";

const tabs = [
  { id: "ingresar", label: "Ingresar" },
  { id: "crear-cuenta", label: "Crear cuenta" },
] as const;

type TabId = (typeof tabs)[number]["id"];

// Fichas Ingresar / Crear cuenta, con el patrón ARIA de tabs
// (flechas izquierda/derecha para cambiar de ficha).
export function AuthTabs({ volver }: { volver?: string }) {
  const [active, setActive] = useState<TabId>("ingresar");

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    const index = tabs.findIndex((tab) => tab.id === active);
    const next = tabs[(index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    setActive(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  }

  return (
    <div>
      <div
        aria-label="Acceso"
        className="grid grid-cols-2 rounded-lg bg-brand-soft p-1"
        onKeyDown={handleKeyDown}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;

          return (
            <button
              aria-controls={`panel-${tab.id}`}
              aria-selected={isActive}
              className={cn(
                "h-10 rounded-md text-sm font-semibold transition",
                isActive ? "bg-surface text-brand shadow-sm" : "text-muted hover:text-ink",
              )}
              id={`tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActive(tab.id)}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Ambos paneles quedan montados para no perder lo escrito al cambiar de ficha. */}
      {tabs.map((tab) => (
        <div
          aria-labelledby={`tab-${tab.id}`}
          className="mt-8"
          hidden={tab.id !== active}
          id={`panel-${tab.id}`}
          key={tab.id}
          role="tabpanel"
        >
          {tab.id === "ingresar" ? <LoginForm volver={volver} /> : <RegisterForm volver={volver} />}
        </div>
      ))}
    </div>
  );
}
