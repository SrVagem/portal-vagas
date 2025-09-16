"use client";

import '@ant-design/v5-patch-for-react-19';
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ConfigProvider, theme as antdTheme, ThemeConfig, App as AntdApp } from "antd";

type ThemeMode = "light" | "dark";
type Ctx = { mode: ThemeMode; toggle: () => void; set: (m: ThemeMode) => void };

const ThemeCtx = createContext<Ctx | null>(null);
export const useThemeMode = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return ctx;
};

function getSystemPref(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("theme") as ThemeMode | null) : null;
    setMode(saved ?? getSystemPref());
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    html.dataset.theme = mode;
    html.style.colorScheme = mode;
    localStorage.setItem("theme", mode);
    document.body.style.background = mode === "dark" ? "#0a0a0a" : "#ffffff";
    document.body.style.color = mode === "dark" ? "#e5e5e5" : "#111111";
  }, [mode]);

  const algorithms = mode === "dark" ? [antdTheme.darkAlgorithm] : [antdTheme.defaultAlgorithm];
  const tokenOverrides: ThemeConfig["token"] = useMemo(() => ({
    colorBgBase: mode === "dark" ? "#0a0a0a" : "#ffffff",
    colorTextBase: mode === "dark" ? "#e5e5e5" : "#141414",
    borderRadius: 10,
  }), [mode]);

  const ctx: Ctx = useMemo(() => ({
    mode,
    toggle: () => setMode(m => (m === "dark" ? "light" : "dark")),
    set: (m) => setMode(m),
  }), [mode]);

  return (
    <ThemeCtx.Provider value={ctx}>
      <ConfigProvider theme={{ algorithm: algorithms as any, token: tokenOverrides }}>
        {/* Provider do AntD para message/notification/modal por hook */}
        <AntdApp>
          {children}
        </AntdApp>
      </ConfigProvider>
    </ThemeCtx.Provider>
  );
}
