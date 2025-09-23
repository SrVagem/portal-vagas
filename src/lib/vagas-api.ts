export type VagaAPI = {
  id?: number | string;     // id no front (opcional)
  titulo?: string;
  descricao?: string;
  requisitos?: string;
  local?: string;           // seu nome antigo
  local_trabalho?: string;  // nome novo (aceito também)
  contrato?: string;        // seu nome antigo
  tipo_contrato?: string;   // nome novo (aceito também)
  salario?: number | string;
  beneficios?: string;
  status?: string;
  responsavel?: string;
  abertura?: string;        // seu nome antigo (se tiver)
  fechamento?: string;      // seu nome antigo (se tiver)
  data_fechamento?: string; // nome novo
};

const DEFAULT_HEADERS = { "content-type": "application/json" };

async function handle(res: Response) {
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    console.error("API ERROR", res.status, res.statusText, text);
    throw new Error(`API ${res.status} ${res.statusText}: ${text || "sem corpo"}`);
  }
  try { return text ? JSON.parse(text) : {}; } catch { return { raw: text }; }
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

// ——— CONSULTA ———
export async function consultaVagas() {
  try {
    const res = await fetch("/api/vagas/consulta", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });

    const text = await res.text().catch(() => "");
    if (!res.ok) {
      console.error("consultaVagas →", res.status, res.statusText, text);
      return [];
    }

    const data = text ? JSON.parse(text) : [];
    const arr = Array.isArray(data) ? data : [];

    // Mapeia do payload do n8n -> modelo do app
    const toDate = (s?: string | null) =>
      s ? (s.includes("T") ? s.split("T")[0] : s) : undefined;

    return arr.map((r: any) => {
      const idNum = Number(r.id_vaga);
      return {
        id: Number.isFinite(idNum) ? idNum : r.id_vaga, // garante número
        titulo: r.titulo,
        descricao: r.descricao,
        requisitos: r.requisitos,
        local: r.local_trabalho,        // traduz
        contrato: r.tipo_contrato,      // traduz
        salario: r.salario,             // pode vir number; deixe como está
        beneficios: r.beneficios,
        status: r.status,
        responsavel: r.responsavel,
        abertura: toDate(r.data_abertura),
        fechamento: toDate(r.data_fechamento),
        // mantenha r completo, se precisar:
        _raw: r,
      };
    });
  } catch (err) {
    console.error("consultaVagas catch →", err);
    return [];
  }
}


// ——— INCLUI ———
export async function criaVaga(v: VagaAPI) {
  // envia com seus nomes antigos; o proxy traduz
  const res = await fetch("/api/vagas/inclui", {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(v),
  });
  return handle(res);
}

// ——— ALTERA ———
export async function alteraVaga(v: any) {
  const id = toNumericId(v.id ?? v.id_vaga);
  if (id == null) throw new Error("id_vaga é obrigatório para alterar (numérico)");

  const res = await fetch("/api/vagas/altera", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id_vaga: id,
      titulo: v.titulo,
      descricao: v.descricao,
      requisitos: v.requisitos,
      local_trabalho: v.local ?? v.local_trabalho,
      tipo_contrato: v.contrato ?? v.tipo_contrato,
      salario: v.salario,
      beneficios: v.beneficios,
      status: v.status,
      responsavel: v.responsavel,
      data_fechamento: v.fechamento ?? v.data_fechamento,
    }),
  });
  return handle(res);
}

// ——— INATIVA ———
export async function inativaVaga(idLike: number | string) {
  const id = toNumericId(idLike);
  if (id == null) throw new Error("id_vaga é obrigatório para inativar (numérico)");
  const res = await fetch("/api/vagas/inativa", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id_vaga: id }),
  });
  return handle(res);
}