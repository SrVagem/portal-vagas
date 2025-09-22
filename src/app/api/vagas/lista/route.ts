export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const upstream = await fetch("https://n8n.uninova.ai/webhook/uninova-lista-vagas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const text = await upstream.text();
    return new Response(text || "[]", {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("[API lista] erro:", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Erro desconhecido" }), { status: 500 });
  }
}
