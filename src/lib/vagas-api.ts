// src/lib/vagas-api.ts
export type StatusVaga = "ABERTA" | "FECHADA" | "INATIVA" | string;

export interface Vaga {
  id: number;                 // ← id_vaga
  nome: string;               // ← titulo
  status: StatusVaga;         // ← status

  // extras visíveis na UI
  descricao?: string | null;
  requisitos?: string | null;
  local_trabalho?: string | null;
  tipo_contrato?: string | null;
  salario?: number | null;
  beneficios?: string | null;
  data_abertura?: string | null;    // ISO
  data_fechamento?: string | null;  // ISO
  responsavel?: string | null;
}

export const STATUS_OPTIONS = [
  { label: "Aberta", value: "ABERTA", color: "green" },
  { label: "Fechada", value: "FECHADA", color: "red" },
  { label: "Inativa", value: "INATIVA", color: "default" },
] as const;

function toUI(row: any): Vaga {
  return {
    id: Number(row.id_vaga),
    nome: String(row.titulo ?? ""),
    status: String(row.status ?? "ABERTA"),
    descricao: row.descricao ?? null,
    requisitos: row.requisitos ?? null,
    local_trabalho: row.local_trabalho ?? null,
    tipo_contrato: row.tipo_contrato ?? null,
    salario: typeof row.salario === "number" ? row.salario : (row.salario ? Number(row.salario) : null),
    beneficios: row.beneficios ?? null,
    data_abertura: row.data_abertura ?? null,
    data_fechamento: row.data_fechamento ?? null,
    responsavel: row.responsavel ?? null,
  };
}

// CONSULTA (POST sem params)
export async function fetchVagas(): Promise<Vaga[]> {
  const res = await fetch("/api/vagas/consulta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`Erro na consulta de vagas: ${res.status} - ${await res.text()}`);
  const data = await res.json();
  const arr = Array.isArray(data) ? data : data?.data ?? [];
  return arr.map(toUI);
}

// INCLUI
export async function createVaga(input: Partial<Vaga> & { nome: string; status?: StatusVaga }): Promise<Vaga> {
  const payload: any = {
    titulo: input.nome,
    status: input.status ?? "ABERTA",
    descricao: input.descricao,
    requisitos: input.requisitos,
    local_trabalho: input.local_trabalho,
    tipo_contrato: input.tipo_contrato,
    salario: input.salario,
    beneficios: input.beneficios,
    responsavel: input.responsavel,
    data_fechamento: input.data_fechamento, // string ISO opcional
  };

  const res = await fetch("/api/vagas/inclui", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Erro ao incluir: ${res.status} - ${await res.text()}`);
  return toUI(await res.json());
}

// ALTERA
export async function updateVaga(id: number, changes: Partial<Vaga>): Promise<Vaga> {
  const payload: any = { id_vaga: id };
  if (changes.nome !== undefined) payload.titulo = changes.nome;
  if (changes.status !== undefined) payload.status = changes.status;
  if (changes.descricao !== undefined) payload.descricao = changes.descricao;
  if (changes.requisitos !== undefined) payload.requisitos = changes.requisitos;
  if (changes.local_trabalho !== undefined) payload.local_trabalho = changes.local_trabalho;
  if (changes.tipo_contrato !== undefined) payload.tipo_contrato = changes.tipo_contrato;
  if (changes.salario !== undefined) payload.salario = changes.salario;
  if (changes.beneficios !== undefined) payload.beneficios = changes.beneficios;
  if (changes.responsavel !== undefined) payload.responsavel = changes.responsavel;
  if (changes.data_fechamento !== undefined) payload.data_fechamento = changes.data_fechamento;

  const res = await fetch("/api/vagas/altera", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Erro ao alterar: ${res.status} - ${await res.text()}`);
  return toUI(await res.json());
}

// INATIVA
export async function inativaVaga(id: number): Promise<"ok" | Vaga> {
  const res = await fetch("/api/vagas/inativa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_vaga: id }),
  });
  if (!res.ok) throw new Error(`Erro ao inativar: ${res.status} - ${await res.text()}`);
  const data = await res.json();
  if (data?.status === "ok") return "ok";
  return toUI(data);
}
