"use client";

import { useEffect } from "react";
import { Modal, Form, Input, Select, App } from "antd";
import { Vaga } from "@/types/vaga";


type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Vaga | null;
  onClose: () => void;
  onSubmit: (vaga: Vaga) => void;
};

export default function VagaModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<Vaga>();
  const { message } = App.useApp();

  // Repopula o form sempre que abrir ou trocar a vaga
  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initial) {
        form.setFieldsValue(initial);
      }
    }
  }, [open, initial, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload: Vaga = {
      ...(initial ?? { id: Date.now() }), // se for create, gera um id
      ...values,
    };
    onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Nova Vaga" : "Editar Vaga"}
      onCancel={onClose}
      onOk={handleOk}
      okText={mode === "create" ? "Criar" : "Salvar"}
      maskClosable={false}
      destroyOnHidden={false}
    >
      <Form
        layout="vertical"
        form={form}
        preserve={false} // importante para não reter valores antigos
      >
        <Form.Item
          name="titulo"
          label="Título"
          rules={[{ required: true, message: "Informe o título" }]}
        >
          <Input placeholder="Ex.: Desenvolvedor Full Stack Jr" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Informe o status" }]}
        >
          <Select
            options={[
              { value: "ABERTA", label: "Aberta" },
              { value: "FECHADA", label: "Fechada" },
            ]}
          />
        </Form.Item>

        <Form.Item name="responsavel" label="Responsável">
          <Input placeholder="Ex.: RH Tecnologia" />
        </Form.Item>

        <Form.Item name="local" label="Local">
          <Input placeholder="Ex.: São Paulo - SP (Híbrido)" />
        </Form.Item>

        <Form.Item name="contrato" label="Contrato">
          <Input placeholder="Ex.: CLT / PJ / Estágio" />
        </Form.Item>

        <Form.Item name="salario" label="Salário">
          <Input placeholder="Ex.: R$ 4.500,00" />
        </Form.Item>

        <Form.Item name="abertura" label="Abertura">
          <Input placeholder="Ex.: 15/09/2025 13:29" />
        </Form.Item>

        <Form.Item name="fechamento" label="Fechamento">
          <Input placeholder="Opcional" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
