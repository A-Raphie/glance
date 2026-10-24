// Glance /api/ask — takes one camera frame + one question, returns one spoken-style answer.
// The OpenRouter key lives in env; nothing about the request is persisted anywhere.

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

const SYSTEM = `You are Glance, a sight assistant for blind and low-vision users. You receive one photo and one question, and your answer will be read aloud to someone who cannot see the photo.

Rules:
- Lead with the direct answer in one short sentence. Add at most two more sentences of useful detail. Plain spoken sentences — no markdown, no emoji, no bullet lists.
- Only state what is actually visible. If the photo cannot answer the question, say exactly that and say what would help ("move closer", "more light", "turn it around").
- Never invent text, brands, prices, dates, or people. If asked to read, quote the visible text exactly; mark parts too unclear to read as [unclear]. Do not guess at unclear words.
- For locations use left, center, right, or clock positions from the viewer's point of view.
- People: describe clothing, position, and actions generically. Never guess identity, age, or emotion as fact.
- Safety first: if something in the photo could burn, cut, trip, scald, or be medicine mishandled, name it in your first sentence.`;

const DEFAULT_MODELS = 'google/gemini-2.5-flash,openai/gpt-4o-mini';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  try {
    const { image, question, mode } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
    const isDataImage = typeof image === 'string' && image.startsWith('data:image/');
    const isSampleUrl = typeof image === 'string'
      && image.startsWith('https://glance-sepia.vercel.app/samples/')
      && image.endsWith('.jpg');
    if (!isDataImage && !isSampleUrl) {
      res.status(400).json({ error: 'missing image' });
      return;
    }
    if (isDataImage && image.length > 4_500_000) {
      res.status(413).json({ error: 'image too large' });
      return;
    }
    const q = typeof question === 'string' ? question.trim().slice(0, 500) : '';
    const isRead = mode === 'read';

    const userText = isRead
      ? `Read mode. Read all visible text out loud, verbatim, in natural reading order. Mark anything too unclear to read as [unclear]${q ? `. Also answer this: ${q}` : '.'}`
      : (q || 'Describe this scene for someone who cannot see it: what is here, where it is, and anything I should know right now.');

    const models = (process.env.GLANCE_MODELS || DEFAULT_MODELS)
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    let answer: string | null = null;
    let lastStatus = 0;

    for (const model of models) {
      try {
        const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'content-type': 'application/json',
            'HTTP-Referer': process.env.GLANCE_REFERER || 'https://glance.vercel.app',
            'X-Title': 'Glance',
          },
          body: JSON.stringify({
            model,
            max_tokens: 400,
            temperature: 0.2,
            messages: [
              { role: 'system', content: SYSTEM },
              {
                role: 'user',
                content: [
                  { type: 'text', text: userText },
                  { type: 'image_url', image_url: { url: image } },
                ],
              },
            ],
          }),
        });
        lastStatus = r.status;
        if (!r.ok) continue;
        const data = await r.json();
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content === 'string' && content.trim()) {
          answer = content.trim();
          break;
        }
      } catch {
        // try the next model in the chain
      }
    }

    if (!answer) {
      res.status(502).json({ error: `no model answered (last status ${lastStatus})` });
      return;
    }
    res.status(200).json({ answer });
  } catch {
    res.status(500).json({ error: 'bad request' });
  }
}
