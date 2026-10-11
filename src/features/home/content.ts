import type { StaticImageData } from "next/image";

import imgBijou from "@/assets/home/cat-bijou.webp";
import imgCosmetica from "@/assets/home/cat-cosmetica.webp";
import imgMarroquineria from "@/assets/home/cat-marroquineria.webp";
import imgRegalos from "@/assets/home/cat-regalos.webp";
import imgRelojes from "@/assets/home/cat-relojes.webp";
import imgTecnologia from "@/assets/home/cat-tecnologia.webp";

// Contenido editorial de la Home. Las categorías son vitrinas fijas hasta
// que el catálogo exista en la base; entonces se reemplazan por datos reales.

export type HomeCategory = {
  nombre: string;
  descripcion: string;
  imagen: StaticImageData;
  href: string;
};

export const homeCategories: HomeCategory[] = [
  {
    nombre: "Bijou",
    descripcion: "Collares, aros y pulseras para todos los días",
    imagen: imgBijou,
    href: "/catalogo",
  },
  {
    nombre: "Marroquinería",
    descripcion: "Carteras, billeteras y complementos",
    imagen: imgMarroquineria,
    href: "/catalogo",
  },
  {
    nombre: "Relojes y accesorios",
    descripcion: "Detalles que completan cualquier look",
    imagen: imgRelojes,
    href: "/catalogo",
  },
  {
    nombre: "Cuidado personal",
    descripcion: "Fragancias y cosmética para mimarse",
    imagen: imgCosmetica,
    href: "/catalogo",
  },
  {
    nombre: "Tecnología",
    descripcion: "Accesorios prácticos para regalar",
    imagen: imgTecnologia,
    href: "/catalogo",
  },
  {
    nombre: "Listos para regalar",
    descripcion: "Sets y obsequios armados con dedicación",
    imagen: imgRegalos,
    href: "/catalogo",
  },
];

export const occasions = [
  "Cumpleaños",
  "Aniversario",
  "Día de la Madre",
  "Día del Padre",
  "Amigo invisible",
  "Agradecimiento",
  "Graduación",
  "Porque sí",
];
