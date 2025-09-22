// src/lib/vagas-api.ts
// Cliente centralizado usando os endpoints internos /api/vagas/*

export type VagaAPI = {
  id?: number | string;
  titulo: string;
  status: "ABERTA" | "FECHADA";
  responsavel?: string;
  local?: string;
  contrato?: string;
  salario?: string;
  abertura?: string;
  fechamento?: string;
};

// ------------------------------------
// Configuração básica de fetch/handler
// ------------------------------------
const DEFAULT_HEADERS: HeadersInit = { "content-type": "application/json" };

async function handle<T = any>(res: Response): Promise<T> {
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    console.error("API ERROR", res.status, res.statusText, text);
    throw new Error(`API ${res.status} ${res.statusText}: ${text || "sem corpo"}`);
  }
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    // Caso a API retorne texto puro
    return { raw: text } as unknown as T;
  }
}

// ------------------------------------
// Helpers de corpo (mapeia p/ n8n)
// ------------------------------------
const prune = (o: Record<string, any>) => {
  Object.keys(o).forEach((k) => o[k] === undefined && delete o[k]);
  return o;
};

const toBody = (v: Partial<VagaAPI>) =>
  prune({
    ...(v.id ? { id_vaga: v.id } : {}),
    titulo: v.titulo,
    status: v.status,
    responsavel: v.responsavel,
    local: v.local,
    contrato: v.contrato,
    salario: v.salario,
    abertura: v.abertura,
    fechamento: v.fechamento,
  });

// ------------------------------------
// Operações (todas via /api/vagas/*)
// ------------------------------------

// ---- CONSULTA (única que pode ir sem params)
export async function listaVagas() {
  const res = await fetch("/api/vagas/lista", {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: "{}",
  });
  return handle<VagaAPI[]>(res);
}

// ---- INSERE
export async function criaVaga(v: VagaAPI) {
  const res = await fetch("/api/vagas/inclui", {
    method: "POST",
    headers: DEFAULT_HEADERS,
    // no create não enviamos id (deixa o backend/n8n definir)
    body: JSON.stringify(toBody({ ...v, id: undefined })),
  });
  return handle(res);
}

// ---- ALTERA (exige id_vaga + todos os campos)
export async function alteraVaga(v: VagaAPI) {
  if (!v?.id) throw new Error("id_vaga é obrigatório para alterar");
  const res = await fetch("/api/vagas/altera", {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(toBody(v)),
  });
  return handle(res);
}

// ---- INATIVA (apenas id_vaga)
export async function inativaVaga(id: number | string) {
  if (!id) throw new Error("id_vaga é obrigatório para inativar");
  const res = await fetch("/api/vagas/inativa", {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ id_vaga: id }),
  });
  return handle(res);
}
