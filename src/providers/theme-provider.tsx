"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
  useCallback,
} from "react";
import {
  ConfigProvider,
  theme as antdTheme,
  type ThemeConfig,
  App as AntdApp,
} from "antd";

export type ThemeMode = "light" | "dark";

type ThemeCtx = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const ThemeModeContext = createContext<ThemeCtx | null>(null);

/** Hook para ler/alterar o tema global (quando usando ThemeModeProvider) */
export function useThemeMode(): ThemeCtx {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) return { mode: "light", setMode: () => {}, toggle: () => {} };
  return ctx;
}

/** Provider com estado interno + persistência e sincronização com a classe <html>. */
export function ThemeModeProvider({
  children,
  defaultMode = "light" as ThemeMode,
}: {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  // Carrega preferência do usuário (ou media query) no client
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme-mode") as ThemeMode | null;
      if (saved === "light" || saved === "dark") {
        setMode(saved);
        return;
      }
      if (typeof window !== "undefined" && window.matchMedia) {
        const prefersDark = window
          .matchMedia("(prefers-color-scheme: dark)")
          .matches;
        setMode(prefersDark ? "dark" : "light");
      }
    } catch {
      // ignore
    }
  }, []);

  // Persiste e reflete no <html class="dark">
  useEffect(() => {
    try {
      localStorage.setItem("theme-mode", mode);
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", mode === "dark");
      }
    } catch {
      // ignore
    }
  }, [mode]);

  const toggle = useCallback(
    () => setMode((m) => (m === "dark" ? "light" : "dark")),
    []
  );

  const algorithm: ThemeConfig["algorithm"] = useMemo(
    () => (mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm),
    [mode]
  );

  // Tokens base mínimos (você pode estender mais abaixo nos overrides)
  const token: ThemeConfig["token"] = useMemo(
    () => ({
      colorBgBase: mode === "dark" ? "#0a0a0a" : "#ffffff",
      colorTextBase: mode === "dark" ? "#e5e5e5" : "#141414",
      borderRadius: 10,
      fontSize: 14,
    }),
    [mode]
  );

  // Overrides por componente + tokens adicionais dependentes do modo
  const themeConfig: ThemeConfig = useMemo(
    () => ({
      algorithm,
      token: {
        ...token,
        borderRadius: 16,
        colorBorder: "rgba(255,255,255,0.12)",
        colorBorderSecondary: "rgba(255,255,255,0.08)",
        colorBgLayout: mode === "dark" ? "#0f0f10" : "#f6f7f8",
        colorBgContainer: mode === "dark" ? "#1b1c1f" : "#ffffff",
        colorText: mode === "dark" ? "rgb(240,240,240)" : "#1f1f1f",
        controlHeight: 36,
        controlHeightLG: 40,
        padding: 12,
        paddingLG: 16,
      },
      components: {
        Card: {
          borderRadiusLG: 16,
          colorBorder: "rgba(255,255,255,0.08)",
          padding: 16,
        },
        Table: {
          borderRadiusLG: 16,
          headerBg: mode === "dark" ? "#242529" : "#f5f6f8",
          headerColor:
            mode === "dark" ? "rgba(255,255,255,0.85)" : "#1f1f1f",
          rowHoverBg: mode === "dark" ? "#1f2023" : "#fafafa",
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
    }),
    [algorithm, token, mode]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, toggle }}>
      <ConfigProvider theme={themeConfig}>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ThemeModeContext.Provider>
  );
}

/**
 * Versão simples: recebe `mode` por props (útil se você controla fora).
 * Mantém os mesmos tokens/overrides baseados em `mode`.
 */
export interface ThemeProviderProps {
  mode: ThemeMode;
  children: React.ReactNode;
}

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
      fontSize: 14,
    }),
    [mode]
  );

  const themeConfig: ThemeConfig = useMemo(
    () => ({
      algorithm,
      token: {
        ...token,
        borderRadius: 16,
        colorBorder: "rgba(255,255,255,0.12)",
        colorBorderSecondary: "rgba(255,255,255,0.08)",
        colorBgLayout: mode === "dark" ? "#0f0f10" : "#f6f7f8",
        colorBgContainer: mode === "dark" ? "#1b1c1f" : "#ffffff",
        colorText: mode === "dark" ? "rgb(240,240,240)" : "#1f1f1f",
        controlHeight: 36,
        controlHeightLG: 40,
        padding: 12,
        paddingLG: 16,
      },
      components: {
        Card: {
          borderRadiusLG: 16,
          colorBorder: "rgba(255,255,255,0.08)",
          padding: 16,
        },
        Table: {
          borderRadiusLG: 16,
          headerBg: mode === "dark" ? "#242529" : "#f5f6f8",
          headerColor:
            mode === "dark" ? "rgba(255,255,255,0.85)" : "#1f1f1f",
          rowHoverBg: mode === "dark" ? "#1f2023" : "#fafafa",
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
    }),
    [algorithm, token, mode]
  );

  return (
    <ConfigProvider theme={themeConfig}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
