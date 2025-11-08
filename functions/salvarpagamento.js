export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  };

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  if (method !== "POST") {
    return new Response("Método não permitido", { status: 405, headers });
  }

  let debug = [];
  try {
    const body = await request.json();
    const SUP_URL = env.SUPABASE_URL;
    const SUP_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

    debug.push(`SUP_URL: ${SUP_URL || "NULO"}`);
    debug.push(`SUP_KEY prefix: ${SUP_KEY ? SUP_KEY.substring(0,10) + "..." : "NULO"}`);

    if (!SUP_URL || !SUP_KEY) {
      return new Response(debug.join("\n") + "\nVariáveis de ambiente ausentes.", { status: 500, headers });
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
    debug.push("Supabase status: " + res.status);
    debug.push("Supabase resposta: " + text);

    if (!res.ok) {
      return new Response(debug.join("\n"), { status: 500, headers });
    }

    debug.push("✅ Dados salvos com sucesso!");
    return new Response(debug.join("\n"), { status: 200, headers });
  } catch (err) {
    debug.push("Erro interno: " + err.message);
    return new Response(debug.join("\n"), { status: 500, headers });
  }
}
