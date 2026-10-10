import { LogOut } from "lucide-react";
import type { Metadata } from "next";

import { SiteLogo } from "@/components/layout/site-logo";
import { logoutAction } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false },
};

// Layout del panel de administración. La verificación de sesión la hace
// cada página (dentro de <Suspense>) y cada server action.
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-3 px-3 sm:px-5">
          <SiteLogo className="h-14" />
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Panel
          </span>
          <form action={logoutAction} className="ml-auto">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-medium transition hover:bg-brand-soft"
              type="submit"
            >
              <LogOut className="size-4" />
              Salir
            </button>
          </form>
        </div>
      </header>
      {children}
    </>
  );
}
