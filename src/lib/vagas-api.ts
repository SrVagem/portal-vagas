// src/lib/vagas-api.ts
// Cliente centralizado para os webhooks do n8n (vagas)

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

// =========================
// Config por VAR de ambiente
// =========================
//
// Por padrão usa seu domínio n8n e os 3 endpoints que você enviou.
// Para listar, ajusta aqui embaixo (ou via env NEXT_PUBLIC_VAGAS_LIST_PATH).
//
const BASE =
  process.env.NEXT_PUBLIC_VAGAS_BASE?.replace(/\/$/, "") ||
  "https://n8n.uninova.ai/webhook";

const PATH_LIST =
  process.env.NEXT_PUBLIC_VAGAS_LIST_PATH || "uninova-lista-vagas"; // <- troque se seu listar tiver outro nome
const PATH_CREATE =
  process.env.NEXT_PUBLIC_VAGAS_CREATE_PATH || "uninova-insere-vagas";
const PATH_UPDATE =
  process.env.NEXT_PUBLIC_VAGAS_UPDATE_PATH || "uninova-altera-vagas";
const PATH_INACTIVATE =
  process.env.NEXT_PUBLIC_VAGAS_INACTIVATE_PATH || "uninova-inativa-vagas";

// Ex.: se quiser apontar cada rota diretamente (sem BASE), defina:
// NEXT_PUBLIC_VAGAS_LIST_URL, NEXT_PUBLIC_VAGAS_CREATE_URL, etc.
const URL_LIST =
  process.env.NEXT_PUBLIC_VAGAS_LIST_URL || `${BASE}/${PATH_LIST}`;
const URL_CREATE =
  process.env.NEXT_PUBLIC_VAGAS_CREATE_URL || `${BASE}/${PATH_CREATE}`;
const URL_UPDATE =
  process.env.NEXT_PUBLIC_VAGAS_UPDATE_URL || `${BASE}/${PATH_UPDATE}`;
const URL_INACTIVATE =
  process.env.NEXT_PUBLIC_VAGAS_INACTIVATE_URL || `${BASE}/${PATH_INACTIVATE}`;

// Se seu n8n exige algum header (ex.: token), configure aqui:
const DEFAULT_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
  // "x-api-key": process.env.NEXT_PUBLIC_VAGAS_TOKEN ?? "",
};

// Helper padrão
async function handle<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    // tenta ler JSON, se não der, texto
    try {
      const j = await res.json();
      throw new Error(
        typeof j === "object" && j && "message" in j ? j.message : JSON.stringify(j)
      );
    } catch {
      const t = await res.text().catch(() => "");
      throw new Error(t || `HTTP ${res.status}`);
    }
  }
  // alguns webhooks podem não retornar JSON em todas as rotas
  try {
    return (await res.json()) as T;
  } catch {
    // sem corpo/JSON
    return undefined as unknown as T;
  }
}

// =========================
// Operações
// =========================
export async function listaVagas(): Promise<VagaAPI[]> {
  const res = await fetch(URL_LIST, {
    method: "GET",
    // evitar cache na listagem
    cache: "no-store",
    headers: DEFAULT_HEADERS,
  });
  return await handle<VagaAPI[]>(res);
}

export async function criaVaga(payload: VagaAPI) {
  const res = await fetch(URL_CREATE, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });
  return await handle(res);
}

export async function alteraVaga(payload: VagaAPI) {
  const res = await fetch(URL_UPDATE, {
    method: "POST", // webhooks n8n normalmente aceitam POST para update
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });
  return await handle(res);
}

export async function inativaVaga(payload: { id: number | string }) {
  const res = await fetch(URL_INACTIVATE, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });
  return await handle(res);
}
