"use client";

import { Card, Typography, Button } from "antd";
import Link from "next/link";
import ClientLayout from "@/components/client-layout";

export default function Home() {
  return (
    <ClientLayout title="Início">
      <Card>
        <Typography.Title level={4}>Bem-vindo ao Portal de Vagas</Typography.Title>
        <Typography.Paragraph>
          Acesse a página de vagas para listar, criar, editar e excluir (em memória)
          e consultar da API real via POST.
        </Typography.Paragraph>
        <Link href="/vagas">
          <Button type="primary">Ir para Vagas</Button>
        </Link>
      </Card>
    </ClientLayout>
  );
}
