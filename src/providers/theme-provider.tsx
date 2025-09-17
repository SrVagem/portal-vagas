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
    <ConfigProvider theme={{ algorithm, token }}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
