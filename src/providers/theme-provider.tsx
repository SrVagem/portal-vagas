// src/providers/theme-provider.tsx
"use client";

import React, { useMemo } from "react";
import { ConfigProvider, theme as antdTheme, ThemeConfig, App as AntdApp } from "antd";

export interface ThemeProviderProps {
  mode: "light" | "dark";
  children: React.ReactNode;
}

export default function ThemeProvider({ mode, children }: ThemeProviderProps) {
  // escolhe algoritmo do tema (sem as any)
  const algorithm: ThemeConfig["algorithm"] = useMemo(() => {
    return mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;
  }, [mode]);

  // tokens customizados
  const token: ThemeConfig["token"] = useMemo(
    () => ({
      colorBgBase: mode === "dark" ? "#0a0a0a" : "#ffffff",
      colorTextBase: mode === "dark" ? "#e5e5e5" : "#141414",
      borderRadius: 10,
    }),
    [mode]
  );

  return (
    <ConfigProvider theme={{ algorithm, token }}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
