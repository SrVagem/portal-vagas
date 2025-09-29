// src/app/layout.tsx
import "antd/dist/reset.css";
import "./globals.css";
import AntdCompat from "./antd-compat";

import ThemeProviderClient from "@/components/theme-provider-client";
import DarkModeToggle from "@/components/dark-mode-toggle";

// ⬇️ importa o provider de modo (light/dark) que criamos no theme-provider
import { ThemeModeProvider } from "@/providers/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-950 text-neutral-50 antialiased">
        <AntdCompat />

        {/* 🔌 Disponibiliza o contexto de tema (light/dark) para toda a árvore */}
        <ThemeModeProvider>
          {/* Cabeçalho simples com o botão de alternância */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h1 className="text-base font-semibold tracking-tight">Portal de Vagas</h1>
            <DarkModeToggle />
          </header>

          {/* Seu provider/compat do Ant Design + app */}
          <ThemeProviderClient>{children}</ThemeProviderClient>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
