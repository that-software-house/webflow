import OpenAI from "openai";

const openai = new OpenAI();

// CORS headers for Webflow embed on thatsoftwarehouse.com
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

export default async (req, context) => {
  // Handle CORS pre‑flight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  try {
    const body = await req.text();
    const { prompt } = JSON.parse(body || '{}');
    if (!prompt) return context.json({ error: 'No prompt' }, { status: 400 });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [{ role: "system", content: "You are the helpful TSH website assistant." },
                 { role: "user", content: prompt }]
    });

    return new Response(completion.toReadableStream(), {
      status: 200,
      headers: {
        ...CORS,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive"
      }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS }
    });
  }
};
