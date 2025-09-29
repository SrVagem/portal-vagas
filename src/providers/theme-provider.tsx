"use client";

import React, { useEffect, useMemo, useState, useContext, createContext, useCallback } from "react";
import { ConfigProvider, theme as antdTheme, ThemeConfig, App as AntdApp } from "antd";

export type ThemeMode = "light" | "dark";

type ThemeCtx = { mode: ThemeMode; setMode: (m: ThemeMode) => void; toggle: () => void; };
const ThemeModeContext = createContext<ThemeCtx | null>(null);

export function useThemeMode(): ThemeCtx {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) return { mode: "light", setMode: () => {}, toggle: () => {} };
  return ctx;
}

export function ThemeModeProvider({ children, defaultMode = "light" as ThemeMode }: { children: React.ReactNode; defaultMode?: ThemeMode }) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  // Detecta se o <html> está com a classe "dark" (ex.: via tailwind/next-themes)
  const isDark =
  typeof window !== "undefined"
    ? document.documentElement.classList.contains("dark")
    : false;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme-mode") as ThemeMode | null;
      if (saved === "light" || saved === "dark") { setMode(saved); return; }
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("theme-mode", mode);
      document.documentElement.classList.toggle("dark", mode === "dark");
    } catch {}
  }, [mode]);

  const toggle = useCallback(() => setMode(m => (m === "dark" ? "light" : "dark")), []);

  const algorithm: ThemeConfig["algorithm"] = useMemo(() => (
    mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
  ), [mode]);

  const token: ThemeConfig["token"] = useMemo(() => ({
    colorBgBase: mode === "dark" ? "#0a0a0a" : "#ffffff",
    colorTextBase: mode === "dark" ? "#e5e5e5" : "#141414",
    borderRadius: 10,
  }), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, toggle }}>
      <ConfigProvider theme={{ algorithm, token }}>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ThemeModeContext.Provider>
  );
}

export interface ThemeProviderProps { mode: ThemeMode; children: React.ReactNode; }
export default function ThemeProvider({ mode, children }: ThemeProviderProps) {
  const algorithm: ThemeConfig["algorithm"] = useMemo(() => (
    mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
  ), [mode]);

  const token: ThemeConfig["token"] = useMemo(() => ({
    colorBgBase: mode === "dark" ? "#0a0a0a" : "#ffffff",
    colorTextBase: mode === "dark" ? "#e5e5e5" : "#141414",
    borderRadius: 10,
  }), [mode]);

  return (
    <ConfigProvider
  theme={{
    // usa o algoritmo dark/light conforme seu estado de tema
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    // ---------- TOKENS GERAIS ----------
    token: {
      fontSize: 14,
      borderRadius: 16,                 // cantos arredondados “do clone”
      colorBorder: "rgba(255,255,255,0.12)",
      colorBorderSecondary: "rgba(255,255,255,0.08)",
      colorBgLayout: isDark ? "#0f0f10" : "#f6f7f8",
      colorBgContainer: isDark ? "#1b1c1f" : "#ffffff",
      colorText: isDark ? "rgb(240,240,240)" : "#1f1f1f",
      controlHeight: 36,
      controlHeightLG: 40,
      padding: 12,
      paddingLG: 16,
    },
    // ---------- AJUSTES POR COMPONENTE ----------
    components: {
      Card: {
        borderRadiusLG: 16,
        colorBorder: "rgba(255,255,255,0.08)",
        padding: 16,
      },
      Table: {
        borderRadiusLG: 16,
        headerBg: isDark ? "#242529" : "#f5f6f8",
        headerColor: isDark ? "rgba(255,255,255,0.85)" : "#1f1f1f",
        rowHoverBg: isDark ? "#1f2023" : "#fafafa",
      },
      Button: {
        borderRadius: 16,
      },
      Modal: {
        borderRadiusLG: 16,
      },
      Input: {
        borderRadius: 12,
      },
      Select: {
        borderRadius: 12,
      },
      Tag: {
        borderRadiusSM: 999,
      },
    },
  }}
>
  {children}
</ConfigProvider>
  );
}
