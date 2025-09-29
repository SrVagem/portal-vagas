"use client";

import { Button, Tooltip } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useThemeMode } from "@/providers/theme-provider";

export default function DarkModeToggle() {
  const { mode, toggle } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <Tooltip title={isDark ? "Alternar para claro" : "Alternar para escuro"} mouseEnterDelay={0.15}>
      <Button
        aria-label="Alternar tema"
        onClick={toggle}
        type="text"
        shape="circle"
        size="large"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        style={{
          width: 36,
          height: 36,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
        }}
      />
    </Tooltip>
  );
}
