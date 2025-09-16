"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X as XIcon, Save, Ban } from "lucide-react";
import type { Vaga, StatusVaga } from "@/lib/vagas-api";
import { STATUS_OPTIONS } from "@/lib/vagas-api";

const MODAL_WIDTH = 900;
const PADDING = 16;
const OFFSET_Y = -60;

export type VagaFormValues = {
  id?: number;
  nome: string;
  status: StatusVaga;
  descricao?: string;
  requisitos?: string;
  local_trabalho?: string;
  modalidade?: string;
  salario?: number;
  beneficios?: string;
  responsavel?: string;
  data_fechamento?: string;
};

type Props = {
  open: boolean;
  title?: string;
  initialValues?: Partial<Vaga>;
  onCancel: () => void;
  onSubmit: (values: VagaFormValues) => Promise<void> | void;
  isSaving?: boolean;
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const VagaModal: React.FC<Props> = ({
  open,
  title = "Nova Vaga",
  initialValues,
  onCancel,
  onSubmit,
  isSaving = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const width = useMemo(() => {
    if (typeof window === "undefined") return MODAL_WIDTH;
    return Math.min(MODAL_WIDTH, window.innerWidth - PADDING * 2);
  }, [open]);

  // Centraliza ao abrir
  useEffect(() => {
    if (!open) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(MODAL_WIDTH, vw - PADDING * 2);
    const x = Math.max(PADDING, Math.round((vw - w) / 2));
    const y = Math.max(PADDING, Math.round((vh - 560) / 2) + OFFSET_Y);
    setPosition({ x, y });
  }, [open]);

  // Reposiciona se janela redimensionar
  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      if (!modalRef.current) return;
      const rect = modalRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxX = vw - rect.width - PADDING;
      const maxY = vh - Math.min(rect.height, vh - PADDING * 2) - PADDING;
      setPosition((p) => ({ x: clamp(p.x, PADDING, maxX), y: clamp(p.y, PADDING, Math.max(PADDING, maxY)) }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !modalRef.current) return;
      const rect = modalRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxX = vw - rect.width - PADDING;
      const maxY = vh - Math.min(rect.height, vh - PADDING * 2) - PADDING;
      setPosition({
        x: clamp(e.clientX - offset.x, PADDING, Math.max(PADDING, maxX)),
        y: clamp(e.clientY - offset.y, PADDING, Math.max(PADDING, maxY)),
      });
    },
    [isDragging, offset]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [open, handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!modalRef.current) return;
    const target = e.target as HTMLElement;
    if (target.id === "modal-header" || target.closest("#modal-header")) {
      setIsDragging(true);
      const rect = modalRef.current.getBoundingClientRect();
      setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      e.preventDefault();
    }
  };

  const [formData, setFormData] = useState<VagaFormValues>({
    id: initialValues?.id,
    nome: initialValues?.nome ?? "",
    status: (initialValues?.status as StatusVaga) ?? "ABERTA",
    descricao: initialValues?.descricao ?? "",
    requisitos: initialValues?.requisitos ?? "",
    local_trabalho: initialValues?.local_trabalho ?? "",
    modalidade: initialValues?.modalidade ?? "",
    salario: typeof initialValues?.salario === "number" ? initialValues?.salario : undefined,
    beneficios: initialValues?.beneficios ?? "",
    responsavel: initialValues?.responsavel ?? "",
    data_fechamento: initialValues?.data_fechamento ? toISODate(initialValues.data_fechamento as any) : undefined,
  });

  useEffect(() => {
    if (!open) return;
    setFormData({
      id: initialValues?.id,
      nome: initialValues?.nome ?? "",
      status: (initialValues?.status as StatusVaga) ?? "ABERTA",
      descricao: initialValues?.descricao ?? "",
      requisitos: initialValues?.requisitos ?? "",
      local_trabalho: initialValues?.local_trabalho ?? "",
      modalidade: initialValues?.modalidade ?? "",
      salario: typeof initialValues?.salario === "number" ? initialValues?.salario : undefined,
      beneficios: initialValues?.beneficios ?? "",
      responsavel: initialValues?.responsavel ?? "",
      data_fechamento: initialValues?.data_fechamento ? toISODate(initialValues.data_fechamento as any) : undefined,
    });
  }, [open, initialValues]);

  const setField = <K extends keyof VagaFormValues>(key: K, value: VagaFormValues[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const onChangeText =
    (key: keyof VagaFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setField(key, e.target.value);

  const onChangeSelect =
    (key: keyof VagaFormValues) => (e: React.ChangeEvent<HTMLSelectElement>) =>
      setField(key, e.target.value as any);

  const onChangeNumber = (key: keyof VagaFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setField(key, raw === "" ? undefined : Number(raw));
  };

  const onSubmitClick = async () => { await onSubmit(formData); };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={isSaving ? undefined : onCancel}
        style={{ position: "fixed", inset: 0, height: "100vh", backgroundColor: "var(--gcs-backdrop)", zIndex: 1000 }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        onMouseDown={handleMouseDown}
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          width,
          backgroundColor: "var(--gcs-bg)",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header (arrastável) */}
        <div
          id="modal-header"
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--gcs-border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "move",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          <h3 style={{ margin: 0}}>{title}</h3>
          <button
            onClick={isSaving ? undefined : onCancel}
            className="btn btn-gray"
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
            aria-label="Fechar"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem", maxHeight: "70vh", overflow: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="modal-label">ID</label>
              <input className="modal-input" value={formData.id ?? ""} disabled />
            </div>

            <div>
              <label className="modal-label">Status *</label>
              <select className="modal-input" value={formData.status} onChange={onChangeSelect("status")} disabled={isSaving}>
                {(STATUS_OPTIONS as Array<{ label: string; value: StatusVaga }>).map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="modal-label">Responsável</label>
              <input className="modal-input" value={formData.responsavel ?? ""} onChange={onChangeText("responsavel")} disabled={isSaving} placeholder="Ex: Maria Silva" />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="modal-label">Nome da Vaga *</label>
              <input className="modal-input" value={formData.nome} onChange={onChangeText("nome")} disabled={isSaving} placeholder="Ex: Desenvolvedor Front-end" />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="modal-label">Descrição</label>
              <textarea className="modal-input" value={formData.descricao ?? ""} onChange={onChangeText("descricao")} disabled={isSaving} placeholder="Resumo da posição, responsabilidades, etc." rows={4} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="modal-label">Requisitos</label>
              <textarea className="modal-input" value={formData.requisitos ?? ""} onChange={onChangeText("requisitos")} disabled={isSaving} placeholder="Tecnologias, experiência, formação..." rows={3} />
            </div>

            <div>
              <label className="modal-label">Local de Trabalho</label>
              <input className="modal-input" value={formData.local_trabalho ?? ""} onChange={onChangeText("local_trabalho")} disabled={isSaving} placeholder="Ex: Brasília - DF" />
            </div>

            <div>
              <label className="modal-label">Modalidade</label>
              <select className="modal-input" value={formData.modalidade ?? ""} onChange={onChangeSelect("modalidade")} disabled={isSaving}>
                <option value="">—</option>
                <option value="Presencial">Presencial</option>
                <option value="Remoto">Remoto</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            <div>
              <label className="modal-label">Salário (R$)</label>
              <input className="modal-input" type="number" step="0.01" value={formData.salario ?? ""} onChange={onChangeNumber("salario")} disabled={isSaving} placeholder="Ex: 4500.00" />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="modal-label">Benefícios</label>
              <input className="modal-input" value={formData.beneficios ?? ""} onChange={onChangeText("beneficios")} disabled={isSaving} placeholder="Ex: VT, VR, Plano de Saúde..." />
            </div>

            <div>
              <label className="modal-label">Data de Fechamento</label>
              <input className="modal-input" type="date" value={formData.data_fechamento ?? ""} onChange={(e) => setField("data_fechamento", e.target.value || undefined)} disabled={isSaving} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--gcs-border-color)", display: "flex", justifyContent: "flex-end", gap: ".5rem" }}>
          <button onClick={isSaving ? undefined : onCancel} className="btn btn-gray" style={{ padding: "8px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Ban size={16} /> Cancelar
          </button>
          <button onClick={onSubmitClick} disabled={isSaving} className="btn btn-green" style={{ padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Save size={16} /> {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </>
  );
};

export default VagaModal;

function toISODate(input: string) {
  try {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch { return ""; }
}
