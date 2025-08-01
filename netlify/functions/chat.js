import OpenAI from "openai";

const openai = new OpenAI();

// CORS headers for Webflow embed on thatsoftwarehouse.com
const CORS = {
  "Access-Control-Allow-Origin": "https://thatsoftwarehouse.com",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default async (req, context) => {
  // Handle CORS pre‑flight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  try {
    const { prompt } = JSON.parse(req.body || '{}');
    if (!prompt) return context.json({ error: 'No prompt' }, { status: 400 });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [{ role: "system", content: "You are the helpful TSH website assistant." },
                 { role: "user", content: prompt }]
    });

    return new Response(completion.toReadableStream(), {
      headers: { "Content-Type": "text/plain; charset=utf-8", ...CORS },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: CORS,
    });
  }
};
