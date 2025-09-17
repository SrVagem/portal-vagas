// src/providers/theme-provider.tsx
"use client";

import React, { useEffect, useMemo, useState, useContext, createContext, useCallback } from "react";
import { ConfigProvider, theme as antdTheme, ThemeConfig, App as AntdApp } from "antd";

/** ===== Tipos ===== */
export type ThemeMode = "light" | "dark";

/** ===== Contexto para quem quiser ler/alterar o tema via hook ===== */
type ThemeCtx = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const ThemeModeContext = createContext<ThemeCtx | null>(null);

/** Hook que seu client-layout importa */
export function useThemeMode(): ThemeCtx {
  const ctx = useContext(ThemeModeContext);
  // fallback seguro se alguém usar o hook sem Provider
  if (!ctx) {
    return {
      mode: "light",
      setMode: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}

/** ===== Provider com estado interno (salva em localStorage e respeita prefers-color-scheme) ===== */
export function ThemeModeProvider({ children, defaultMode = "light" as ThemeMode }: { children: React.ReactNode; defaultMode?: ThemeMode }) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  // ler tema salvo / sistema
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme-mode") as ThemeMode | null;
      if (saved === "light" || saved === "dark") {
        setMode(saved);
        return;
      }
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    } catch {
      // ignore
    }
  }, []);

  // persistir
  useEffect(() => {
    try {
      localStorage.setItem("theme-mode", mode);
      // opcional: classe no html/body se você usa Tailwind dark
      document.documentElement.classList.toggle("dark", mode === "dark");
    } catch {
      // ignore
    }
  }, [mode]);

  const toggle = useCallback(() => setMode((m) => (m === "dark" ? "light" : "dark")), []);

  // tokens e algoritmo do antd
  const algorithm: ThemeConfig["algorithm"] = useMemo(
    () => (mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm),
    [mode]
  );

  const token: ThemeConfig["token"] = useMemo(
    () => ({
      colorBgBase: mode === "dark" ? "#0a0a0a" : "#ffffff",
      colorTextBase: mode === "dark" ? "#e5e5e5" : "#141414",
      borderRadius: 10,
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, toggle }}>
      <ConfigProvider theme={{ algorithm, token }}>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ThemeModeContext.Provider>
  );
}

/** ===== Provider "estático" (compat) — se você quiser forçar o modo via prop ===== */
export interface ThemeProviderProps {
  mode: ThemeMode;
  children: React.ReactNode;
}

/** Export default mantido (sem hook), útil se você passar o mode de fora */
export default function ThemeProvider({ mode, children }: ThemeProviderProps) {
  const algorithm: ThemeConfig["algorithm"] = useMemo(
    () => (mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm),
    [mode]
  );

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
