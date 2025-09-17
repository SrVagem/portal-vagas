// -------------------------------
// Tipos base
// -------------------------------
export type StatusVaga = "ABERTA" | "FECHADA" | "INATIVA" | (string & {});

export interface Vaga {
  id: number;
  nome: string; // título da vaga
  status: StatusVaga;

  descricao?: string;
  requisitos?: string;
  local_trabalho?: string;
  modalidade?: string; // presencial/híbrido/remoto
  salario?: number;
  beneficios?: string;
  responsavel?: string;
  data_fechamento?: string | Date; // ISO (yyyy-mm-dd) ou Date
}

// Filtros de consulta (ajuste conforme precisar na sua UI)
export interface VagaFiltro {
  busca?: string;
  status?: StatusVaga;
}

// Payload “esperado” pelo webhook (ajuste nomes se seu n8n usa outros)
type N8nVagaPayload = {
  id?: number | string;
  titulo?: string;
  status?: StatusVaga;
  descricao?: string;
  requisitos?: string;
  local_trabalho?: string;
  modalidade?: string;
  salario?: number;
  beneficios?: string;
  responsavel?: string;
  data_fechamento?: string; // sempre string ISO no backend
};

// -------------------------------
// Helpers
// -------------------------------

class HttpError extends Error {
  status: number;
  body: string | undefined;
  constructor(message: string, status: number, body?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

async function fetchJSON<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const text = await res.text();
  if (!res.ok) {
    throw new HttpError(`Request failed: ${res.status}`, res.status, text);
  }
  try {
    return text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    // Se backend retornar texto vazio ou inválido
    return {} as T;
  }
}

function toNumberOrUndefined(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toStringOrEmpty(v: unknown): string {
  return v == null ? "" : String(v);
}

function toIsoDateOnly(d: unknown): string | undefined {
  if (!d) return undefined;
  if (typeof d === "string") {
    // assume já vem ISO ou "yyyy-mm-dd"
    return d.slice(0, 10);
  }
  if (d instanceof Date) {
    return d.toISOString().slice(0, 10);
  }
  return undefined;
}

/**
 * Converte o objeto vindo do backend (n8n) para o shape da UI (Vaga).
 * Aceita várias possibilidades de nomes de campos.
 */
function toUI(it: unknown): Vaga {
  const o = (it ?? {}) as Record<string, unknown>;

  const idRaw = o.id ?? o.id_vaga ?? o.codigo ?? o.codigo_vaga;
  const tituloRaw = o.titulo ?? o.nome ?? o.nome_vaga;

  return {
    id: Number(idRaw ?? 0),
    nome: toStringOrEmpty(tituloRaw),
    status: toStringOrEmpty(o.status) as StatusVaga,

    descricao: o.descricao as string | undefined,
    requisitos: o.requisitos as string | undefined,
    local_trabalho: (o.local_trabalho ?? o.local ?? o.cidade) as string | undefined,
    modalidade: (o.modalidade ?? o.tipo ?? o.formato) as string | undefined,
    salario: toNumberOrUndefined(o.salario),
    beneficios: o.beneficios as string | undefined,
    responsavel: (o.responsavel ?? o.contato) as string | undefined,
    data_fechamento:
      typeof o.data_fechamento === "string"
        ? o.data_fechamento
        : o.data_fechamento instanceof Date
        ? o.data_fechamento
        : undefined,
  };
}

/**
 * Converte do modelo da UI para o payload do backend (n8n).
 * Ajuste as chaves se seu workflow espera nomes diferentes.
 */
function toBackend(input: Partial<Vaga>): N8nVagaPayload {
  return {
    id: input.id,
    titulo: input.nome,
    status: input.status,
    descricao: input.descricao,
    requisitos: input.requisitos,
    local_trabalho: input.local_trabalho,
    modalidade: input.modalidade,
    salario: input.salario,
    beneficios: input.beneficios,
    responsavel: input.responsavel,
    data_fechamento: toIsoDateOnly(input.data_fechamento),
  };
}

// -------------------------------
// API pública
// -------------------------------

/**
 * Lista/consulta vagas.
 * Se o seu backend exigir filtros por query/body, adapte aqui.
 */
export async function consultaVagas(filtro?: VagaFiltro): Promise<Vaga[]> {
  // Se precisar enviar filtros, troque para POST com body JSON.
  // Aqui vou de POST para ser mais flexível:
  const body: Record<string, unknown> = {};
  if (filtro?.busca) body.busca = filtro.busca;
  if (filtro?.status) body.status = filtro.status;

  const data = await fetchJSON<unknown[]>("/api/vagas/consulta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    // keepalive ajuda um pouco quando chamado em navegação
    keepalive: true,
  });

  return Array.isArray(data) ? data.map(toUI) : [];
}

/**
 * Inclui uma vaga.
 * `nome` é obrigatório; demais campos opcionais.
 */
export async function incluiVaga(input: Partial<Vaga> & { nome: string; status?: StatusVaga }): Promise<Vaga> {
  const payload = toBackend({ status: "ABERTA", ...input });

  const data = await fetchJSON<unknown>("/api/vagas/inclui", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  return toUI(data);
}

/**
 * Altera/atualiza uma vaga existente.
 * `id` é obrigatório.
 */
export async function alteraVaga(input: Partial<Vaga> & { id: number }): Promise<Vaga> {
  const payload = toBackend(input);

  const data = await fetchJSON<unknown>("/api/vagas/altera", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  return toUI(data);
}

/**
 * Inativa (ou fecha) uma vaga existente.
 * `id` é obrigatório. Você pode passar `status` se quiser “FECHADA” vs “INATIVA”.
 */
export async function inativaVaga(params: { id: number; status?: Extract<StatusVaga, "INATIVA" | "FECHADA"> }): Promise<Vaga> {
  const payload: N8nVagaPayload = {
    id: params.id,
    status: params.status ?? "INATIVA",
  };

  const data = await fetchJSON<unknown>("/api/vagas/inativa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  return toUI(data);
}
