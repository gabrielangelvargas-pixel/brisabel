import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { appConfig } from "@/config/app";
import { SiteNavigation } from "@/components/site-navigation";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.url),
  title: appConfig.name,
  description: appConfig.description,
  alternates: {
    canonical: appConfig.url,
  },
  openGraph: {
    title: appConfig.name,
    description: appConfig.description,
    url: appConfig.url,
    siteName: appConfig.name,
    type: "website",
    locale: "es_AR",
    images: [
      {
        url: appConfig.image,
        width: 1200,
        height: 1200,
        alt: appConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: appConfig.name,
    description: appConfig.description,
    images: [appConfig.image],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SiteNavigation />
      </body>
    </html>
  );
}
