import { HeaderActions } from "@/components/layout/header-actions";
import { SiteLogo } from "@/components/layout/site-logo";
import { SiteMenu } from "@/components/layout/site-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-2 px-3 sm:px-5 md:h-24 lg:h-28">
        <SiteMenu />
        <SiteLogo className="h-16 md:h-20 lg:h-24" />
        <HeaderActions />
      </div>
    </header>
  );
}
