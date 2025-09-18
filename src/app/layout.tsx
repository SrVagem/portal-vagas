// src/app/layout.tsx
import "antd/dist/reset.css";
import "./globals.css";
import AntdCompat from "./antd-compat";

import ThemeProviderClient from "@/components/theme-provider-client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-950 text-neutral-50 antialiased">
        <AntdCompat />
        <ThemeProviderClient>{children}</ThemeProviderClient>
      </body>
    </html>
  );
}
