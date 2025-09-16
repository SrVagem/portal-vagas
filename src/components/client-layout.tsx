"use client";

import { Layout, Menu, Typography, Switch, Tooltip } from "antd";
import { HomeOutlined, AppstoreAddOutlined } from "@ant-design/icons";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useThemeMode } from "@/providers/theme-provider";

const { Header, Sider, Content } = Layout;

export default function ClientLayout({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { mode, toggle } = useThemeMode();

  const selectedKeys = pathname.startsWith("/vagas") ? ["vagas"] : ["home"];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme={mode === "dark" ? "dark" : "light"}>
        <div
          style={{
            height: 56, display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "0 16px", fontWeight: 700,
          }}
        >
          {collapsed ? "PV" : "Portal Vagas"}
        </div>
        <Menu
          theme={mode === "dark" ? "dark" : "light"}
          mode="inline"
          selectedKeys={selectedKeys}
          items={[
            { key: "home", icon: <HomeOutlined />, label: <Link href="/">Início</Link> },
            { key: "vagas", icon: <AppstoreAddOutlined />, label: <Link href="/vagas">Vagas</Link> },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "transparent",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "space-between",
          }}
        >
          <Typography.Title level={3} style={{ margin: 0 }}>
            {title ?? "Portal de Vagas"}
          </Typography.Title>

          <Tooltip title={mode === "dark" ? "Alternar para claro" : "Alternar para escuro"}>
            <Switch
              checked={mode === "dark"}
              onChange={toggle}
              checkedChildren={<Moon size={16} />}
              unCheckedChildren={<Sun size={16} />}
            />
          </Tooltip>
        </Header>

        <Content style={{ margin: 16 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
