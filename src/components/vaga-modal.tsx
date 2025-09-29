"use client";

import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  App,
  Tag,
  Space,
} from "antd";
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

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (initial) form.setFieldsValue(initial);
  }, [open, initial, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: Vaga = {
        ...(initial ?? { id: Date.now() }), // gera id para criação
        ...values,
      };
      onSubmit(payload);
    } catch {
      // validação já mostra mensagens
    }
  };

  const titleNode = (
    <Space size={8} align="center">
      <span>{mode === "create" ? "Nova Vaga" : "Editar Vaga"}</span>
      {initial?.id != null && <Tag color="blue">#{initial.id}</Tag>}
    </Space>
  );

  return (
    <Modal
      open={open}
      title={titleNode}
      onCancel={onClose}
      onOk={handleOk}
      okText={mode === "create" ? "Criar" : "Salvar"}
      width={820}            // mais espaço para as 2 colunas
      destroyOnClose
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        {/* Mantém o id no form (oculto) só pra edição */}
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Row gutter={[16, 12]}>
          <Col span={24}>
            <Form.Item
              label="Título"
              name="titulo"
              rules={[{ required: true, message: "Informe o título" }]}
            >
              <Input placeholder="Ex: Desenvolvedor(a) Full Stack Jr" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Selecione o status" }]}
            >
              <Select
                placeholder="Selecione..."
                options={[
                  { value: "ABERTA", label: "Aberta" },
                  { value: "FECHADA", label: "Fechada" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Responsável" name="responsavel">
              <Input placeholder="Ex: RH Tecnologia" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Local" name="local">
              <Input placeholder="Ex: São Paulo - SP (Híbrido)" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Contrato" name="contrato">
              <Select
                allowClear
                placeholder="Selecione..."
                options={[
                  { value: "CLT", label: "CLT" },
                  { value: "PJ", label: "PJ" },
                  { value: "Estágio", label: "Estágio" },
                  { value: "Temporário", label: "Temporário" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Salário" name="salario">
              <Input placeholder="Ex: 4500" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Abertura" name="abertura">
              <Input placeholder="Ex: 2025-09-15" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Fechamento" name="fechamento">
              <Input placeholder="Opcional" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Descrição" name="descricao">
              <Input.TextArea rows={4} placeholder="Resumo da vaga..." />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Requisitos" name="requisitos">
              <Input.TextArea rows={4} placeholder="Tecnologias, experiências, etc." />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Benefícios" name="beneficios">
              <Input.TextArea rows={3} placeholder="Plano de saúde, VR/VA, etc." />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
