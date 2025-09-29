"use client";

import { Button, Tooltip } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useThemeMode } from "@/providers/theme-provider";

export default function DarkModeToggle() {
  const { mode, toggle } = useThemeMode();

  return (
    <Tooltip title={mode === "dark" ? "Alternar para claro" : "Alternar para escuro"}>
      <Button
        shape="circle"
        onClick={toggle}
        icon={mode === "dark" ? <SunOutlined /> : <MoonOutlined />}
      />
    </Tooltip>
  );
}
