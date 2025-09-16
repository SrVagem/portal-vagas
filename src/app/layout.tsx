// src/app/layout.tsx
import type { Metadata } from "next";
import "antd/dist/reset.css";
import "./globals.css";
import ThemeProvider from "@/providers/theme-provider";

export const metadata: Metadata = {
  title: "Portal de Vagas",
  description: "CRUD de vagas (consulta via POST)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Provider de tema (client) aplicando light/dark + tokens do AntD */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
