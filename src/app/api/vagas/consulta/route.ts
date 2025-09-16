export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const r = await fetch('https://n8n.uninova.ai/webhook/uninova-consulta-vagas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });

    const data = await r.json().catch(() => ({}));
    return new Response(JSON.stringify(data), {
      status: r.status,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? 'Erro desconhecido' }), { status: 500 });
  }
}
