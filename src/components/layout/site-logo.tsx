import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

type SiteLogoProps = {
  className?: string;
  onClick?: () => void;
};

export function SiteLogo({ className, onClick }: SiteLogoProps) {
  return (
    <Link
      aria-label={`${siteConfig.name} - Inicio`}
      className={cn("inline-flex shrink-0", className)}
      href="/"
      onClick={onClick}
    >
      <Image
        alt={siteConfig.name}
        className="h-full w-auto"
        height={siteConfig.logo.height}
        loading="eager"
        src={siteConfig.logo.src}
        width={siteConfig.logo.width}
      />
    </Link>
  );
}
