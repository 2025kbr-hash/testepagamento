export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  };

  if (method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (method !== "POST") return new Response("Método não permitido", { status: 405, headers });

  try {
    const body = await request.json();
    const SUP_URL = env.SUPABASE_URL;
    const SUP_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUP_URL || !SUP_KEY) {
      return new Response("Variáveis de ambiente ausentes.", { status: 500, headers });
    }

    const res = await fetch(`${SUP_URL}/rest/v1/pagamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUP_KEY,
        Authorization: `Bearer ${SUP_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    return new Response(`Supabase retornou: ${res.status}\\n${text}`, {
      status: res.ok ? 200 : 500,
      headers,
    });
  } catch (err) {
    return new Response("Erro interno: " + err.message, { status: 500, headers });
  }
}
