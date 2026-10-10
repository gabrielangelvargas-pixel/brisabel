import { SiteLogo } from "@/components/layout/site-logo";
import { SiteMenu } from "@/components/layout/site-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-3 sm:px-5">
        <SiteMenu />
        <SiteLogo className="h-12" eager />
      </div>
    </header>
  );
}
