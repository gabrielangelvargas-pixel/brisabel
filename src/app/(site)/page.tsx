import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Próximamente
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-ink">{siteConfig.name}</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        {siteConfig.description}
      </p>
    </main>
  );
}
