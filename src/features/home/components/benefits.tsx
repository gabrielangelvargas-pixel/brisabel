import { HandHeart, ShieldCheck, Sparkles, Truck } from "lucide-react";

// Textos tomados del sitio anterior de Brisabel; ajustar si cambian las condiciones.
const benefits = [
  {
    icon: Sparkles,
    titulo: "Selección variada",
    texto: "Ideas para todos los gustos",
  },
  {
    icon: ShieldCheck,
    titulo: "Compra simple",
    texto: "Elegí, pedí y listo",
  },
  {
    icon: HandHeart,
    titulo: "Productos cuidados",
    texto: "Elegidos uno por uno",
  },
  {
    icon: Truck,
    titulo: "Envíos coordinados",
    texto: "Acordamos la entrega con vos",
  },
];

export function Benefits() {
  return (
    <section aria-label="Por qué elegirnos" className="border-y border-line bg-surface">
      <ul className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-4 gap-y-8 px-5 py-10 md:grid-cols-4">
        {benefits.map(({ icon: Icon, titulo, texto }) => (
          <li className="flex flex-col items-center gap-3 text-center md:flex-row md:text-left" key={titulo}>
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Icon className="size-6" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">{titulo}</span>
              <span className="block text-xs text-muted">{texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
