"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Typography, App, theme as antdTheme } from "antd";
import { HomeOutlined, TableOutlined } from "@ant-design/icons";
import { useThemeMode } from "@/providers/theme-provider";

const { Sider, Header, Content } = Layout;

export default function ClientLayout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const selectedKey = pathname.startsWith("/vagas") ? "/vagas" : "/";
  const items = [
    { key: "/", icon: <HomeOutlined />, label: <Link href="/">Início</Link> },
    { key: "/vagas", icon: <TableOutlined />, label: <Link href="/vagas">Vagas</Link> },
  ];

  const { token } = antdTheme.useToken();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <Layout style={{ minHeight: "100dvh", background: token.colorBgLayout }}>
      {/* Sidebar fixa */}
      <Sider
        width={220}
        theme={isDark ? "dark" : "light"} // ✅ respeita o tema
        style={{
          position: "sticky",
          top: 0,
          height: "100dvh",
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            padding: 16,
            color: token.colorText,
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          Portal Vagas
        </div>

        <Menu
          theme={isDark ? "dark" : "light"} // ✅ respeita o tema
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
          style={{ borderInlineEnd: 0 }}
        />
      </Sider>

      {/* Conteúdo com header */}
      <Layout>
        <Header
          style={{
            background: "transparent",
            padding: "16px 24px",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {title && (
            <Typography.Title
              level={2}
              style={{ margin: 0, color: token.colorText }}
            >
              {title}
            </Typography.Title>
          )}
        </Header>

        {/* App fornece contexto para message/notification/modal */}
        <App>
          <Content style={{ padding: 24 }}>
            <div style={{ margin: "0 auto", maxWidth: 1280 }}>{children}</div>
          </Content>
        </App>
      </Layout>
    </Layout>
  );
}
