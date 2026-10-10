import { SiteHeader } from "@/components/layout/site-header";

// Layout de la tienda pública. El panel de administración tendrá el suyo.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
