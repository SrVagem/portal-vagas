// src/components/theme-provider-client.tsx
"use client";

import React from "react";
import { ThemeModeProvider } from "@/providers/theme-provider";

export default function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  return <ThemeModeProvider>{children}</ThemeModeProvider>;
}
