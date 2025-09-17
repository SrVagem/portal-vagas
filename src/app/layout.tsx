"use client";
import "./globals.css";
import { ThemeModeProvider } from "@/providers/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-950 text-neutral-50 antialiased">
        <ThemeModeProvider>{children}</ThemeModeProvider>
      </body>
    </html>
  );
}
