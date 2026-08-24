import { ArrowRight, Database, GitBranch, Server } from "lucide-react";

import { appConfig } from "@/config/app";

const setupItems = [
  {
    title: "Frontend",
    description: "Next.js, TypeScript y Tailwind listos para construir la interfaz.",
    icon: Server,
  },
  {
    title: "Datos",
    description: "Prisma configurado para conectar con MySQL en Hostinger.",
    icon: Database,
  },
  {
    title: "Deploy",
    description: "Estructura preparada para subir a GitHub y desplegar como app web.",
    icon: GitBranch,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfaf8] text-[#1d1d1f]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between border-b border-[#ded8cf] pb-5">
          <span className="text-lg font-semibold">{appConfig.name}</span>
          <span className="rounded-full border border-[#ded8cf] px-3 py-1 text-sm text-[#5f5a55]">
            MVP inicial
          </span>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-[#7b4f32]">
              Base tecnica
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Brisabel ya tiene su punto de partida.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#5f5a55]">
              Una app web moderna, preparada para crecer con frontend, backend,
              base de datos y despliegue en Hostinger desde GitHub.
            </p>
            <a
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-[#1d1d1f] px-5 text-sm font-medium text-white transition hover:bg-[#3a3633]"
              href="https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/"
              target="_blank"
              rel="noreferrer"
            >
              Guia de deploy
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-4">
            {setupItems.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="rounded-lg border border-[#ded8cf] bg-white p-5 shadow-sm"
                  key={item.title}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#ede4da] text-[#7b4f32]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5f5a55]">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
