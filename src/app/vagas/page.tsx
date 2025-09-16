"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  App as AntdApp,
  Button,
  Card,
  Input,
  Popconfirm,
  Row,
  Col,
  Space,
  Table,
  Tag,
  Tooltip,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, Pencil, Trash2, RefreshCcw, Search } from "lucide-react";
import dayjs from "dayjs";
import ClientLayout from "@/components/client-layout";
import {
  fetchVagas,
  createVaga,
  updateVaga,
  inativaVaga,
  Vaga,
  StatusVaga,
  STATUS_OPTIONS,
} from "@/lib/vagas-api";

/* Resizable headers */
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";

/* Modal separado (clean) */
import VagaModal, { VagaFormValues } from "@/components/vaga-modal";

/* Helpers */
function statusTag(status: StatusVaga) {
  const found = STATUS_OPTIONS.find((s) => s.value === status);
  return <Tag color={found?.color}>{found?.label ?? status}</Tag>;
}
const fmtMoney = (v?: number | null) =>
  v == null ? "" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const fmtDate = (iso?: string | null) =>
  !iso ? "" : dayjs(iso).isValid() ? dayjs(iso).format("DD/MM/YYYY HH:mm") : String(iso);

/* Resizable cell */
type ResizableTitleProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  onResize?: (e: any, data: { size: { width: number; height: number } }) => void;
  width?: number;
};
const ResizableTitle: React.FC<ResizableTitleProps> = ({ onResize, width, children, ...rest }) => {
  if (!width) return <th {...rest}>{children}</th>;
  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize as any}
      draggableOpts={{ enableUserSelectHack: false }}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => e.stopPropagation()}
          style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 8, cursor: "col-resize" }}
        />
      }
    >
      <th {...rest} style={{ position: "relative" }}>
        {children}
      </th>
    </Resizable>
  );
};

export default function PageVagas() {
  const { message } = AntdApp.useApp();
  const { token } = theme.useToken();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Vaga[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vaga | null>(null);

  const [colWidths, setColWidths] = useState<Record<string, number>>({
    id: 90,
    nome: 260,
    status: 120,
    responsavel: 200,
    local_trabalho: 260,
    tipo_contrato: 150,
    salario: 130,
    data_abertura: 170,
    data_fechamento: 170,
    descricao: 300,
    requisitos: 300,
    beneficios: 260, // <- sem acento (evita chave errada)
    actions: 168,
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return data;
    return data.filter((v) =>
      [
        String(v.id),
        v.nome,
        v.status,
        v.descricao ?? "",
        v.requisitos ?? "",
        v.local_trabalho ?? "",
        v.tipo_contrato ?? "",
        v.beneficios ?? "",
        v.responsavel ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [data, search]);

  async function load() {
    setLoading(true);
    try {
      const items = await fetchVagas();
      setData(items);
    } catch (e: any) {
      message.error(e?.message ?? "Erro ao carregar vagas");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function handleOpenCreate() { setEditing(null); setModalOpen(true); }
  function handleOpenEdit(record: Vaga) { setEditing(record); setModalOpen(true); }

  async function handleSubmit(values: VagaFormValues) {
    try {
      if (editing) {
        const updated = await updateVaga(editing.id, {
          nome: values.nome, status: values.status, descricao: values.descricao, requisitos: values.requisitos,
          local_trabalho: values.local_trabalho, tipo_contrato: values.tipo_contrato, salario: values.salario,
          beneficios: values.beneficios, responsavel: values.responsavel,
          data_fechamento: values.data_fechamento?.toISOString(),
        });
        setData((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        message.success("Vaga atualizada");
      } else {
        const created = await createVaga({
          nome: values.nome, status: values.status, descricao: values.descricao, requisitos: values.requisitos,
          local_trabalho: values.local_trabalho, tipo_contrato: values.tipo_contrato, salario: values.salario,
          beneficios: values.beneficios, responsavel: values.responsavel,
          data_fechamento: values.data_fechamento?.toISOString(),
        });
        setData((prev) => [created, ...prev]);
        message.success("Vaga criada");
      }
      setModalOpen(false);
      setEditing(null);
    } catch (e: any) {
      message.error(e?.message ?? "Erro ao salvar");
    }
  }

  async function onInativar(record: Vaga) {
    try {
      const result = await inativaVaga(record.id);
      if (result === "ok") {
        setData((prev) => prev.map((v) => (v.id === record.id ? { ...v, status: "INATIVA" } : v)));
      } else {
        setData((prev) => prev.map((v) => (v.id === record.id ? result : v)));
      }
      message.success("Vaga inativada");
    } catch (e: any) {
      message.error(e?.message ?? "Erro ao inativar");
    }
  }

  const ellipsisCell = (key: keyof Vaga) => (_: any, record: Vaga) => ({
    title: record[key] == null ? "" : String(record[key] as any),
  });

  const columnsBase: ColumnsType<Vaga> = [
    { title: "ID", dataIndex: "id", key: "id", width: colWidths.id, sorter: (a, b) => a.id - b.id },
    { title: "Título", dataIndex: "nome", key: "nome", width: colWidths.nome, ellipsis: true, onCell: ellipsisCell("nome") },
    {
      title: "Status", dataIndex: "status", key: "status", width: colWidths.status,
      render: (_: any, r) => statusTag(r.status),
      filters: STATUS_OPTIONS.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (v: any, r) => r.status === v,
    },
    { title: "Responsável", dataIndex: "responsavel", key: "responsavel", width: colWidths.responsavel, ellipsis: true, onCell: ellipsisCell("responsavel") },
    { title: "Local", dataIndex: "local_trabalho", key: "local_trabalho", width: colWidths.local_trabalho, ellipsis: true, onCell: ellipsisCell("local_trabalho") },
    { title: "Contrato", dataIndex: "tipo_contrato", key: "tipo_contrato", width: colWidths.tipo_contrato, onCell: ellipsisCell("tipo_contrato") },
    { title: "Salário", dataIndex: "salario", key: "salario", width: colWidths.salario, render: (v: number) => fmtMoney(v) },
    { title: "Abertura", dataIndex: "data_abertura", key: "data_abertura", width: colWidths.data_abertura, render: fmtDate },
    { title: "Fechamento", dataIndex: "data_fechamento", key: "data_fechamento", width: colWidths.data_fechamento, render: fmtDate },
    { title: "Descrição", dataIndex: "descricao", key: "descricao", width: colWidths.descricao, ellipsis: true, onCell: ellipsisCell("descricao") },
    { title: "Requisitos", dataIndex: "requisitos", key: "requisitos", width: colWidths.requisitos, ellipsis: true, onCell: ellipsisCell("requisitos") },
    { title: "Benefícios", dataIndex: "beneficios", key: "beneficios", width: colWidths.beneficios, ellipsis: true, onCell: ellipsisCell("beneficios") },
    {
      title: "Ações",
      key: "actions",
      fixed: "right",
      width: colWidths.actions,
      render: (_: any, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button size="small" onClick={() => handleOpenEdit(record)} icon={<Pencil size={16} />} />
          </Tooltip>
          <Popconfirm
            title="Inativar vaga?"
            description={`Você tem certeza que deseja inativar "${record.nome}"?`}
            okText="Sim"
            cancelText="Não"
            onConfirm={() => onInativar(record)}
          >
            <Button danger size="small" icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns: ColumnsType<Vaga> = columnsBase.map((col) => {
    const key = String(col.key);
    if (!col.width) return col;
    return {
      ...col,
      onHeaderCell: (column: any) => ({
        width: column.width,
        onResize: (_: any, { size }: any) =>
          setColWidths((prev) => ({ ...prev, [key]: Math.max(80, Math.min(size.width, 900)) })),
      }),
    } as any;
  });

  return (
    <ClientLayout title="Vagas de Emprego">
      <div className="p-4 grid gap-4">
        {/* Toolbar */}
        <Card className="shadow-lg rounded-2xl">
          <Row gutter={12} align="middle" wrap={false}>
            <Col flex="auto">
              <Input
                allowClear
                prefix={<Search size={16} />}
                placeholder="Buscar em qualquer coluna..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col>
              <Space wrap>
                <Button icon={<RefreshCcw size={16} />} onClick={load} loading={loading}>
                  Recarregar
                </Button>
                <Button type="primary" icon={<Plus size={16} />} onClick={handleOpenCreate}>
                  Nova Vaga
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Tabela */}
        <Card className="shadow-lg rounded-2xl">
          <Table
            rowKey="id"
            size="small"
            loading={loading}
            columns={columns as any}
            dataSource={filtered}
            sticky
            scroll={{ x: Object.values(colWidths).reduce((a, b) => a + b, 0) + 200, y: 520 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            components={{ header: { cell: ResizableTitle as any } }}
          />
        </Card>
      </div>

      {/* Modal (clean) */}
      <VagaModal
        open={modalOpen}
        title={editing ? "Editar Vaga" : "Nova Vaga"}
        initialValues={editing ?? { status: "ABERTA" } as Partial<Vaga>}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </ClientLayout>
  );
}
