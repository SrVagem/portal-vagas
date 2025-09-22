export type VagaAPI = {
  id?: number | string;
  titulo?: string;
  status?: string;
  responsavel?: string;
  local?: string;
  contrato?: string;
  salario?: string;
  abertura?: string;
  fechamento?: string;
};

const DEFAULT_HEADERS = { "content-type": "application/json" };

async function handle(res: Response) {
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    console.error("API ERROR", res.status, res.statusText, text);
    throw new Error(`API ${res.status} ${res.statusText}: ${text || "sem corpo"}`);
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

const toNumericId = (id: unknown) => {
  const n = typeof id === "string" ? parseInt(id, 10) : Number(id);
  return Number.isFinite(n) ? n : undefined;
};

const toBody = (v: VagaAPI) => {
  const o: any = {
    titulo: v.titulo,
    status: v.status,
    responsavel: v.responsavel,
    local: v.local,
    contrato: v.contrato,
    salario: v.salario,
    abertura: v.abertura,
    fechamento: v.fechamento,
  };
  if (v.id != null) o.id_vaga = toNumericId(v.id);
  Object.keys(o).forEach((k) => o[k] === undefined && delete o[k]);
  return o;
};

export async function consultaVagas() {
  try {
    const res = await fetch("/api/vagas/lista", {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: "{}",
    });
    const text = await res.text().catch(() => "");
    if (!res.ok) {
      console.error("consultaVagas →", res.status, res.statusText, text);
      return [];
    }
    const data = text ? JSON.parse(text) : [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("consultaVagas catch →", err);
    return [];
  }
}

export async function criaVaga(v: VagaAPI) {
  const res = await fetch("/api/vagas/inclui", {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(toBody({ ...v, id: undefined })), // sem id no create
  });
  return handle(res);
}

export async function alteraVaga(v: VagaAPI) {
  const id = toNumericId(v.id);
  if (id == null) throw new Error("id_vaga é obrigatório para alterar (numérico)");
  const res = await fetch("/api/vagas/altera", {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ ...toBody(v), id_vaga: id }),
  });
  return handle(res);
}

export async function inativaVaga(idLike: number | string) {
  const id = toNumericId(idLike);
  if (id == null) throw new Error("id_vaga é obrigatório para inativar (numérico)");
  const res = await fetch("/api/vagas/inativa", {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ id_vaga: id }),
  });
  return handle(res);
}
