"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Card,
  Space,
  Input,
  Select,
  Button,
  App,
  Tag,
  Typography,
  Popconfirm,
} from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import ClientLayout from "@/components/client-layout";
import VagaModal from "@/components/vaga-modal";

import {
  consultaVagas,
  criaVaga,
  alteraVaga,
  inativaVaga,
  type VagaAPI,
} from "@/lib/vagas-api";

// -------------------- Tipos locais --------------------
type Vaga = VagaAPI & {
  id: number | string; // garantir id obrigatório na UI
};

// -------------------- Utils --------------------
const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Map opcional (caso o JSON do n8n venha com chaves diferentes)
const mapFromApi = (row: any): Vaga => ({
  id: row.id ?? row.ID ?? row.codigo ?? crypto.randomUUID(),
  titulo: row.titulo ?? row.nome ?? row.title ?? "",
  status:
    (row.status as Vaga["status"]) ??
    (row.situacao as Vaga["status"]) ??
    "ABERTA",
  responsavel: row.responsavel ?? row.owner ?? "",
  local: row.local ?? row.cidade ?? "",
  contrato: row.contrato ?? row.tipo ?? "",
  salario: row.salario ?? row.valor ?? "",
  abertura: row.abertura ?? row.dataAbertura ?? "",
  fechamento: row.fechamento ?? row.dataFechamento ?? "",
});

// -------------------- Página --------------------
export default function VagasPage() {
  const { message } = App.useApp();

  // Dados
  const [data, setData] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<"todos" | "ABERTA" | "FECHADA">("todos");

  // Modal
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "create" | "edit" | null;
    initial: Vaga | null;
  }>({ open: false, mode: null, initial: null });

  // -------- Carregar lista da API --------
  const load = async () => {
    try {
      setLoading(true);
      const rows = await consultaVagas();
      // mapeia cada item para o formato da UI
      setData((rows ?? []).map(mapFromApi));
    } catch (e: any) {
      message.error(`Erro ao listar vagas: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- Filtro local --------
  const dataFiltered = useMemo(() => {
    let out = [...data];
    if (status !== "todos") out = out.filter((v) => v.status === status);
    const q = norm(busca.trim());
    if (q) {
      out = out.filter((v) =>
        [
          v.titulo,
          v.responsavel ?? "",
          v.local ?? "",
          v.contrato ?? "",
          v.salario ?? "",
          v.abertura ?? "",
          v.fechamento ?? "",
        ].some((c) => norm(String(c)).includes(q))
      );
    }
    return out;
  }, [data, status, busca]);

  // -------- Ações --------
  const openCriar = () => setModal({ open: true, mode: "create", initial: null });
  const openEditar = (record: Vaga) =>
    setModal({ open: true, mode: "edit", initial: record });
  const closeModal = () => setModal({ open: false, mode: null, initial: null });

  // -------- Colunas --------
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Título", dataIndex: "titulo", key: "titulo" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: Vaga["status"]) => (
        <Tag color={s === "ABERTA" ? "green" : "red"} style={{ borderRadius: 999 }}>
          {s === "ABERTA" ? "Aberta" : "Fechada"}
        </Tag>
      ),
    },
    { title: "Responsável", dataIndex: "responsavel", key: "responsavel" },
    { title: "Local", dataIndex: "local", key: "local" },
    { title: "Contrato", dataIndex: "contrato", key: "contrato", width: 110 },
    { title: "Salário", dataIndex: "salario", key: "salario", width: 130 },
    { title: "Abertura", dataIndex: "abertura", key: "abertura", width: 160 },
    { title: "Fechamento", dataIndex: "fechamento", key: "fechamento", width: 160 },
    {
      title: "Ações",
      key: "acoes",
      fixed: "right" as const,
      width: 120,
      render: (_: any, record: Vaga) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditar(record)} />
          <Popconfirm
            title="Inativar vaga"
            description={`Confirma inativar a vaga #${record.id}?`}
            okText="Sim"
            cancelText="Não"
            onConfirm={async () => {
              try {
                setLoading(true);
                await inativaVaga({ id: record.id });
                message.success(`Vaga #${record.id} inativada`);
                await load();
              } catch (e: any) {
                message.error(e?.message ?? "Falha ao inativar");
              } finally {
                setLoading(false);
              }
            }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ClientLayout title="Vagas de Emprego">
      {/* Filtros */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            allowClear
            placeholder="Buscar em qualquer coluna..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ width: 360 }}
          />
          <Select
            value={status}
            onChange={(v) => setStatus(v)}
            style={{ width: 160 }}
            options={[
              { value: "todos", label: "Todos" },
              { value: "ABERTA", label: "Aberta" },
              { value: "FECHADA", label: "Fechada" },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
            Recarregar
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCriar}>
            Nova Vaga
          </Button>
        </Space>
      </Card>

      {/* Tabela */}
      <Card>
        <Table<Vaga>
          rowKey="id"
          columns={columns}
          dataSource={dataFiltered}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          size="small" // linhas mais finas
        />
        {dataFiltered.length === 0 && !loading && (
          <Typography.Text type="secondary">
            Nenhum resultado com os filtros atuais.
          </Typography.Text>
        )}
      </Card>

      {/* Modal de criar/editar */}
      {modal.open && (
        <VagaModal
          open={modal.open}
          mode={modal.mode!}
          initial={modal.initial}
          onClose={closeModal}
          onSubmit={async (vagaForm) => {
            try {
              setLoading(true);
              if (modal.mode === "create") {
                await criaVaga(vagaForm as VagaAPI);
                message.success("Vaga criada!");
              } else {
                await alteraVaga(vagaForm as VagaAPI);
                message.success("Vaga atualizada!");
              }
              await load();
              closeModal();
            } catch (e: any) {
              message.error(e?.message ?? "Falha ao salvar vaga");
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </ClientLayout>
  );
}
