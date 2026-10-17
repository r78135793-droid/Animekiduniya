export default async (request) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST for draft generation." }), {
      status: 405, headers: { ...headers, Allow: "POST" },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: "AI is not configured yet. Add OPENAI_API_KEY in Netlify environment variables, then redeploy.",
    }), { status: 503, headers });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Request body must be valid JSON." }), {
      status: 400, headers,
    });
  }

  const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
  const type = typeof body.type === "string" ? body.type.trim().slice(0, 120) : "Anime article";
  if (!title) {
    return new Response(JSON.stringify({ error: "Choose an anime topic first." }), {
      status: 400, headers,
    });
  }

  const prompt = `Write an original, useful, SEO-aware anime blog draft for a site called Anime Ki Duniya.
Topic/anime: ${title}
Article type: ${type}

Requirements:
- Write in clear, natural English with a useful title, introduction, descriptive H2/H3 headings, conclusion, and a concise meta description.
- Create original commentary and wording. Do not copy a publisher's synopsis or imitate another site's article.
- Keep plot description spoiler-light unless the title explicitly asks for spoilers.
- Do not invent exact current ratings, episode counts, release dates, streaming availability, dub/sub availability, or production facts. If a current fact is uncertain, say it needs verification or omit it.
- Include a short "Facts to verify before publishing" checklist for current or uncertain details.
- Avoid keyword stuffing, filler, and claims that this is an official source.
- Return Markdown only. Do not say you are an AI.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 2200,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = result?.error?.message || `OpenAI request failed (${response.status}).`;
      return new Response(JSON.stringify({ error: message }), {
        status: response.status === 429 ? 429 : 502, headers,
      });
    }

    const draft = result.output_text || (result.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    if (!draft.trim()) {
      return new Response(JSON.stringify({ error: "The AI returned no article text. Try again." }), {
        status: 502, headers,
      });
    }

    return new Response(JSON.stringify({ draft }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({
      error: "Could not reach the AI service. Check the Netlify function logs and try again.",
    }), { status: 502, headers });
  }
};
