export const dynamic = "force-dynamic";

function toNumber(x: any) {
  const n = typeof x === "string" ? parseInt(x, 10) : Number(x);
  return Number.isFinite(n) ? n : undefined;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id_vaga = toNumber(body.id_vaga ?? body.id);

    if (!id_vaga) {
      return new Response(JSON.stringify({ error: "id_vaga é obrigatório" }), { status: 400 });
    }

    const upstream = await fetch("https://n8n.uninova.ai/webhook/uninova-inativa-vaga", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id_vaga }),
    });

    const text = await upstream.text();
    return new Response(text || '{"status":"ok"}', {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("[API inativa] erro:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Erro desconhecido" }), { status: 500 });
  }
}
