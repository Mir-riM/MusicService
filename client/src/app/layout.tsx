import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Providers } from "./providers";
import Player from "../components/player/player";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "TatarMusic",
  description: "Сервис для прослушивания музыки",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body className={`${manrope.className} bg-zinc-900 text-zinc-100 antialiased`}>
        <AppRouterCacheProvider>
          <Providers>
            {children}
            <Player />
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
