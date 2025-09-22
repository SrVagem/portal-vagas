export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const upstream = await fetch("https://n8n.uninova.ai/webhook/uninova-insere-vagas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await upstream.text();
    return new Response(text || "{}", {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("[API inclui] erro:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Erro desconhecido" }), { status: 500 });
  }
}
