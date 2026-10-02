import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Vinculación comunitaria | Proyecto CRECE",
  description:
    "Encuesta breve para conocer redes, intereses y formas de participación comunitaria en el proyecto CRECE.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
