import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

import { FavoritesProvider } from "@/components/shared/favorites-provider";
import { Footer } from "@/components/shared/footer";
import { Suspense } from "react";

// One family, two cuts: the wide, heavy cut for headlines (see .display in
// globals.css) and the normal width for everything else.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LOCA",
    template: "%s | LOCA",
  },
  description: "Discover places you'll love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} antialiased`}
      >
        <FavoritesProvider>
          <Suspense
            fallback={
              <main className="min-h-screen animate-pulse bg-background" />
            }
          >
            {children}
          </Suspense>

          <Footer />
        </FavoritesProvider>
      </body>
    </html>
  );
}
