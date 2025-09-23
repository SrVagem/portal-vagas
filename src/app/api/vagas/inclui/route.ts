export const dynamic = "force-dynamic";

// traduz nomes do front -> nomes do n8n/banco
function mapFrontToN8n(body: any) {
  const out: any = {
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
  Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
  return out;
}

function isN8nProdWebhookNotRegistered(text: string) {
  // mensagens típicas do n8n quando o método/endpoint não existe em produção
  return /webhook\s+"POST\s+uninova-inclui-vaga".*not\s+registered/i.test(text)
      || (/not\s+registered\s+for\s+POST/i.test(text) && /did\s+you\s+mean\s+to\s+make\s+a\s+GET/i.test(text));
}

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({}));
    const payload = mapFrontToN8n(raw);

    // 1) tenta POST (o ideal)
    let upstream = await fetch("https://n8n.uninova.ai/webhook/uninova-inclui-vaga", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    let text = await upstream.text();

    // 2) fallback: se o n8n disser que POST não está registrado, refaz como GET
    if (upstream.status === 404 && isN8nProdWebhookNotRegistered(text)) {
      console.warn("[API inclui] POST não disponível no n8n; refazendo como GET (fallback).");
      const url = new URL("https://n8n.uninova.ai/webhook/uninova-inclui-vaga");
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
      upstream = await fetch(url.toString(), { method: "GET", cache: "no-store" });
      text = await upstream.text();
    }

    return new Response(text || "{}", {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("[API inclui] erro:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Erro desconhecido" }), { status: 500 });
  }
}
