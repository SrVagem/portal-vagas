// src/app/vagas/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TableProps } from "antd";
import {
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Popconfirm,
  App as AntdApp,
} from "antd";
import { ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import type { Vaga, StatusVaga } from "@/lib/vagas-api";
import { consultaVagas, inativaVaga, incluiVaga, alteraVaga } from "@/lib/vagas-api";
import VagaModal from "@/components/vaga-modal";

type StatusOption = {
  label: string;
  value: StatusVaga | "";
};

type ModalMode = "create" | "edit";

type ModalState =
  | { open: false; mode?: undefined; initial?: undefined }
  | { open: true; mode: ModalMode; initial?: Partial<Vaga> };

export default function VagasPage() {
  const { message } = AntdApp.useApp?.() ?? {
    message: { success: (_: string) => {}, error: (_: string) => {} },
  };

  // -----------------------------
  // State
  // -----------------------------
  const [data, setData] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>("");
  const [status, setStatus] = useState<StatusVaga | "">("");
  const [inativandoId, setInativandoId] = useState<number | null>(null);

  const [modal, setModal] = useState<ModalState>({ open: false });

  // -----------------------------
  // Options
  // -----------------------------
  const statusOptions: StatusOption[] = useMemo(
    () => [
      { label: "Todos", value: "" },
      { label: "ABERTA", value: "ABERTA" },
      { label: "FECHADA", value: "FECHADA" },
      { label: "INATIVA", value: "INATIVA" },
    ],
    []
  );

  // -----------------------------
  // Load
  // -----------------------------
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const vagas = await consultaVagas({
        busca: busca.trim() || undefined,
        status: status || undefined,
      });
      setData(vagas);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao carregar vagas";
      console.error(err);
      message.error?.(msg);
    } finally {
      setLoading(false);
    }
  }, [busca, status, message]);

  useEffect(() => {
    // carrega ao montar e quando filtros mudarem
    load();
  }, [load]);

  // -----------------------------
  // Actions: tabela e filtros
  // -----------------------------
  const handleInativar = useCallback(
    async (id: number) => {
      setInativandoId(id);
      try {
        const updated = await inativaVaga({ id, status: "INATIVA" });
        setData((prev) => prev.map((v) => (v.id === id ? updated : v)));
        message.success?.("Vaga inativada com sucesso.");
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Não foi possível inativar a vaga.";
        console.error(err);
        message.error?.(msg);
      } finally {
        setInativandoId(null);
      }
    },
    [message]
  );

  const handleResetFiltros = useCallback(() => {
    setBusca("");
    setStatus("");
  }, []);

  // -----------------------------
  // Actions: modal (criar/editar)
  // -----------------------------
  const openCriar = useCallback(() => {
    setModal({ open: true, mode: "create" });
  }, []);

  const openEditar = useCallback((vaga: Vaga) => {
    setModal({ open: true, mode: "edit", initial: vaga });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false });
  }, []);

  const submitCriar = useCallback(
    async (values: Partial<Vaga>) => {
      // garante nome obrigatório
      const nome = values.nome?.trim();
      if (!nome) throw new Error("Título da vaga é obrigatório.");

      const nova = await incluiVaga({
        nome,
        status: values.status ?? "ABERTA",
        descricao: values.descricao,
        requisitos: values.requisitos,
        local_trabalho: values.local_trabalho,
        modalidade: values.modalidade,
        salario: values.salario,
        beneficios: values.beneficios,
        responsavel: values.responsavel,
        data_fechamento: values.data_fechamento,
      });

      // insere no topo
      setData((prev) => [nova, ...prev]);
      message.success?.("Vaga criada com sucesso.");
    },
    [message]
  );

  const submitEditar = useCallback(
    async (values: Partial<Vaga>) => {
      const id = typeof modal.initial?.id === "number" ? modal.initial.id : undefined;
      if (!id) throw new Error("ID da vaga não encontrado para edição.");

      const atualizada = await alteraVaga({
        id,
        nome: values.nome ?? modal.initial?.nome ?? "",
        status: values.status ?? (modal.initial?.status as StatusVaga),
        descricao: values.descricao ?? modal.initial?.descricao,
        requisitos: values.requisitos ?? modal.initial?.requisitos,
        local_trabalho: values.local_trabalho ?? modal.initial?.local_trabalho,
        modalidade: values.modalidade ?? modal.initial?.modalidade,
        salario: values.salario ?? modal.initial?.salario,
        beneficios: values.beneficios ?? modal.initial?.beneficios,
        responsavel: values.responsavel ?? modal.initial?.responsavel,
        data_fechamento: values.data_fechamento ?? modal.initial?.data_fechamento,
      });

      setData((prev) => prev.map((v) => (v.id === id ? atualizada : v)));
      message.success?.("Vaga atualizada com sucesso.");
    },
    [modal.initial, message]
  );

  // -----------------------------
  // Table columns
  // -----------------------------
  const columns: TableProps<Vaga>["columns"] = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 80,
        sorter: (a, b) => a.id - b.id,
        defaultSortOrder: "ascend",
      },
      {
        title: "Título",
        dataIndex: "nome",
        key: "nome",
        ellipsis: true,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        filters: [
          { text: "ABERTA", value: "ABERTA" },
          { text: "FECHADA", value: "FECHADA" },
          { text: "INATIVA", value: "INATIVA" },
        ],
        onFilter: (value, record) => record.status === value,
        render: (value: Vaga["status"]) => {
          const color =
            value === "ABERTA" ? "green" : value === "FECHADA" ? "gold" : value === "INATIVA" ? "red" : "blue";
          return <Tag color={color}>{value}</Tag>;
        },
      },
      {
        title: "Local",
        dataIndex: "local_trabalho",
        key: "local_trabalho",
        ellipsis: true,
      },
      {
        title: "Modalidade",
        dataIndex: "modalidade",
        key: "modalidade",
        width: 140,
      },
      {
        title: "Salário",
        dataIndex: "salario",
        key: "salario",
        width: 120,
        render: (v?: number) =>
          typeof v === "number"
            ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            : "-",
        sorter: (a, b) => (a.salario ?? 0) - (b.salario ?? 0),
      },
      {
        title: "Ações",
        key: "actions",
        fixed: "right",
        width: 240,
        render: (_: unknown, record: Vaga) => (
          <Space>
            <Button size="small" onClick={() => openEditar(record)}>
              Editar
            </Button>
            <Popconfirm
              title="Confirmar inativação"
              description={`Inativar a vaga #${record.id}?`}
              okText="Inativar"
              cancelText="Cancelar"
              onConfirm={() => handleInativar(record.id)}
            >
              <Button size="small" danger loading={inativandoId === record.id}>
                Inativar
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleInativar, inativandoId, openEditar]
  );

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="mx-auto w-full max-w-6xl p-4 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Vagas</h1>
        <Space wrap>
          <Input
            allowClear
            placeholder="Buscar por título, requisitos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onPressEnter={load}
            style={{ width: 260 }}
          />
          <Select
            options={statusOptions}
            value={status}
            onChange={(v) => setStatus(v as StatusOption["value"])}
            style={{ width: 150 }}
          />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
            Recarregar
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCriar}>
            Criar vaga
          </Button>
          <Button onClick={handleResetFiltros} disabled={!busca && !status}>
            Limpar filtros
          </Button>
        </Space>
      </div>

      <Table<Vaga>
        rowKey={(r) => r.id}
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 900 }}
        bordered
      />

      {modal.open && (
        <VagaModal
          open={modal.open}
          mode={modal.mode}
          initial={modal.initial}
          onClose={closeModal}
          onSubmit={modal.mode === "create" ? submitCriar : submitEditar}
        />
      )}
    </div>
  );
}
