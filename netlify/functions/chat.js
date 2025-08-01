import OpenAI from "openai";

const openai = new OpenAI();

export default async (req, context) => {
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
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error(err);
    return context.json({ error: "Server error" }, { status: 500 });
  }
};
