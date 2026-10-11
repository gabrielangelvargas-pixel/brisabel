import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false },
};

// Layout del panel de administración: mismo navbar que la tienda (el admin
// ve además el ícono de panel). La verificación de sesión la hace cada
// página (dentro de <Suspense>) y cada server action.
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
