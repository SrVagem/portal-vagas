// src/components/vaga-modal.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Input, InputNumber, Select, Button, Space, Typography, Divider } from "antd";
import type { SelectProps } from "antd";
import type { Vaga, StatusVaga } from "@/lib/vagas-api";

type Mode = "create" | "edit";

export interface VagaModalProps {
  open: boolean;
  mode: Mode;
  initial?: Partial<Vaga>;
  onClose: () => void;
  onSubmit: (values: Partial<Vaga>) => Promise<void> | void;
  confirmText?: string; // opcional: texto do botão de confirmar
  cancelText?: string;  // opcional: texto do botão de cancelar
  title?: string;       // opcional: título do modal
}

type FormState = {
  nome: string;
  status: StatusVaga;
  descricao?: string;
  requisitos?: string;
  local_trabalho?: string;
  modalidade?: string;
  salario?: number;
  beneficios?: string;
  responsavel?: string;
  data_fechamento?: string; // yyyy-mm-dd
};

const defaultState: FormState = {
  nome: "",
  status: "ABERTA",
  descricao: "",
  requisitos: "",
  local_trabalho: "",
  modalidade: "",
  salario: undefined,
  beneficios: "",
  responsavel: "",
  data_fechamento: undefined,
};

function toFormState(v?: Partial<Vaga>): FormState {
  if (!v) return defaultState;
  const iso =
    typeof v.data_fechamento === "string"
      ? v.data_fechamento.slice(0, 10)
      : v.data_fechamento instanceof Date
      ? v.data_fechamento.toISOString().slice(0, 10)
      : undefined;

  return {
    nome: v.nome ?? "",
    status: (v.status ?? "ABERTA") as StatusVaga,
    descricao: v.descricao ?? "",
    requisitos: v.requisitos ?? "",
    local_trabalho: v.local_trabalho ?? "",
    modalidade: v.modalidade ?? "",
    salario: typeof v.salario === "number" ? v.salario : undefined,
    beneficios: v.beneficios ?? "",
    responsavel: v.responsavel ?? "",
    data_fechamento: iso,
  };
}

export default function VagaModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  confirmText,
  cancelText,
  title,
}: VagaModalProps) {
  const [values, setValues] = useState<FormState>(defaultState);
  const [submitting, setSubmitting] = useState(false);

  // Opções de status — não dependem de `open` (evita o aviso do eslint)
  const statusOptions: SelectProps["options"] = useMemo(
    () => [
      { label: "ABERTA", value: "ABERTA" as StatusVaga },
      { label: "FECHADA", value: "FECHADA" as StatusVaga },
      { label: "INATIVA", value: "INATIVA" as StatusVaga },
    ],
    []
  );

  // Resetar/Preencher quando abrir ou quando mudar o "initial"
  useEffect(() => {
    if (open) {
      setValues(toFormState(initial));
    }
  }, [open, initial]);

  const handleChangeText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleChangeNumber = useCallback((value: number | null) => {
    setValues((prev) => ({ ...prev, salario: typeof value === "number" ? value : undefined }));
  }, []);

  const handleChangeStatus = useCallback((value: StatusVaga) => {
    setValues((prev) => ({ ...prev, status: value }));
  }, []);

  const handleChangeDate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value; // formato yyyy-mm-dd
    setValues((prev) => ({ ...prev, data_fechamento: v || undefined }));
  }, []);

  const disabledOk = useMemo(() => {
    return !values.nome.trim();
  }, [values.nome]);

  const handleOk = useCallback(async () => {
    if (disabledOk) return;
    setSubmitting(true);
    try {
      const payload: Partial<Vaga> = {
        ...(mode === "edit" && typeof initial?.id === "number" ? { id: initial.id } : {}),
        nome: values.nome.trim(),
        status: values.status,
        descricao: values.descricao?.trim() || undefined,
        requisitos: values.requisitos?.trim() || undefined,
        local_trabalho: values.local_trabalho?.trim() || undefined,
        modalidade: values.modalidade?.trim() || undefined,
        salario: values.salario,
        beneficios: values.beneficios?.trim() || undefined,
        responsavel: values.responsavel?.trim() || undefined,
        data_fechamento: values.data_fechamento, // yyyy-mm-dd
      };
      await onSubmit(payload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }, [disabledOk, initial?.id, mode, onClose, onSubmit, values]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const modalTitle = useMemo(() => {
    if (title) return title;
    return mode === "create" ? "Criar vaga" : `Editar vaga${initial?.id ? ` #${initial.id}` : ""}`;
  }, [mode, initial?.id, title]);

  return (
    <Modal
      open={open}
      title={modalTitle}
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ disabled: disabledOk, loading: submitting }}
      cancelButtonProps={{ disabled: submitting }}
      okText={confirmText ?? (mode === "create" ? "Criar" : "Salvar")}
      cancelText={cancelText ?? "Cancelar"}
      destroyOnClose
      maskClosable={!submitting}
      keyboard={!submitting}
      centered
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium mb-1" htmlFor="nome">
              Título da vaga *
            </label>
            <Input
              id="nome"
              name="nome"
              placeholder="Ex.: Desenvolvedor Front-end Pleno"
              value={values.nome}
              onChange={handleChangeText}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="status">
              Status
            </label>
            <Select
              id="status"
              value={values.status}
              options={statusOptions}
              onChange={handleChangeStatus}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="modalidade">
              Modalidade
            </label>
            <Input
              id="modalidade"
              name="modalidade"
              placeholder="Presencial / Híbrido / Remoto"
              value={values.modalidade}
              onChange={handleChangeText}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="local_trabalho">
              Local de trabalho
            </label>
            <Input
              id="local_trabalho"
              name="local_trabalho"
              placeholder="Ex.: Brasília - DF"
              value={values.local_trabalho}
              onChange={handleChangeText}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="salario">
              Salário
            </label>
            <InputNumber
              id="salario"
              name="salario"
              placeholder="Ex.: 5500"
              value={values.salario}
              onChange={handleChangeNumber}
              min={0}
              step={100}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="data_fechamento">
              Data de fechamento
            </label>
            <Input
              id="data_fechamento"
              name="data_fechamento"
              type="date"
              value={values.data_fechamento ?? ""}
              onChange={handleChangeDate}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1" htmlFor="requisitos">
              Requisitos
            </label>
            <Input.TextArea
              id="requisitos"
              name="requisitos"
              placeholder="Tecnologias, experiência, formação..."
              value={values.requisitos}
              onChange={handleChangeText}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1" htmlFor="descricao">
              Descrição
            </label>
            <Input.TextArea
              id="descricao"
              name="descricao"
              placeholder="Fale sobre as responsabilidades e o time..."
              value={values.descricao}
              onChange={handleChangeText}
              autoSize={{ minRows: 3, maxRows: 8 }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1" htmlFor="beneficios">
              Benefícios
            </label>
            <Input.TextArea
              id="beneficios"
              name="beneficios"
              placeholder="Vale-refeição, plano de saúde, bônus..."
              value={values.beneficios}
              onChange={handleChangeText}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1" htmlFor="responsavel">
              Responsável
            </label>
            <Input
              id="responsavel"
              name="responsavel"
              placeholder="Nome do responsável pela vaga"
              value={values.responsavel}
              onChange={handleChangeText}
            />
          </div>
        </div>

        <Divider style={{ margin: "8px 0" }} />

        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Campos marcados com * são obrigatórios.
        </Typography.Paragraph>
      </Space>

      {/* Os botões principais já são controlados pelo Modal (OK/Cancel) */}
      {/* Se quiser um rodapé customizado, você pode usar `footer` no <Modal />. */}
    </Modal>
  );
}
