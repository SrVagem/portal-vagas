export const dynamic = "force-dynamic";

function toNumber(x: any) {
  const n = typeof x === "string" ? parseInt(x, 10) : Number(x);
  return Number.isFinite(n) ? n : undefined;
}

function mapFrontToN8n(body: any) {
  return {
    id_vaga: toNumber(body.id_vaga ?? body.id), // obrigatória no n8n
    titulo: body.titulo,
    descricao: body.descricao ?? body.descricacao,
    requisitos: body.requisitos,
    local_trabalho: body.local_trabalho ?? body.local,
    tipo_contrato: body.tipo_contrato ?? body.contrato,
    salario: body.salario != null ? Number(body.salario) : undefined,
    beneficios: body.beneficios,
    status: body.status,
    responsavel: body.responsavel,
    data_fechamento: body.data_fechamento ?? body.fechamento,
  };
}

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({}));
    const payload = mapFrontToN8n(raw);

    if (!payload.id_vaga) {
      return new Response(JSON.stringify({ error: "id_vaga é obrigatório" }), { status: 400 });
    }

    Object.keys(payload).forEach((k) => (payload as any)[k] === undefined && delete (payload as any)[k]);

    const upstream = await fetch("https://n8n.uninova.ai/webhook/uninova-altera-vagas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    return new Response(text || "{}", {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("[API altera] erro:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Erro desconhecido" }), { status: 500 });
  }
}
