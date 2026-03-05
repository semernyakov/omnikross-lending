const PLATFORM_LIMITS = {
  ru: { vk: 2200, ok: 1200, telegram: 1024, max: 600, habr: 3000 },
  en: { linkedin: 3000, x: 280, instagram: 2200, reddit: 4000 }
} as const;

const PLATFORM_ALIASES = {
  ru: { VK: 'vk', OK: 'ok', Telegram: 'telegram', MAX: 'max', Habr: 'habr' },
  en: { LinkedIn: 'linkedin', 'X/Twitter': 'x', Instagram: 'instagram', Reddit: 'reddit' }
} as const;

export type Lang = keyof typeof PLATFORM_LIMITS;

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export const trimToLimit = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(limit - 1, 1)).trimEnd()}…`;
};

export const resolveSelectedPlatforms = (lang: Lang, channels: unknown) => {
  const allPlatforms = Object.keys(PLATFORM_LIMITS[lang]);
  if (!Array.isArray(channels) || channels.length === 0) return allPlatforms;

  const mapped = channels
    .map((channel) => normalizeText(channel))
    .map((channel) => (PLATFORM_ALIASES[lang] as Record<string, string>)[channel] ?? channel.toLowerCase())
    .filter((channel) => allPlatforms.includes(channel));

  return mapped.length > 0 ? [...new Set(mapped)] : allPlatforms;
};

const buildPrompt = (platform: string, lang: Lang, limit: number, text: string) => {
  const localeHint = lang === 'ru' ? 'Russian language' : 'English language';
  return [
    `You are a senior social media copywriter for ${platform}.`,
    `Return strict JSON only: {"${platform}":"..."}.`,
    `Language: ${localeHint}.`,
    `Character limit is hard max ${limit}.`,
    'Make copy engaging and creative, keep original intent and facts.',
    `Source text: ${text}`
  ].join(' ');
};

export const adaptWithZAISequential = async (text: string, lang: Lang, selectedPlatforms?: string[]) => {
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) throw new Error('ZAI_API_KEY is not configured');

  const limits = PLATFORM_LIMITS[lang];
  const activePlatforms = selectedPlatforms && selectedPlatforms.length > 0 ? selectedPlatforms : Object.keys(limits);

  const result: Record<string, string> = {};

  for (const platform of activePlatforms) {
    const limit = limits[platform as keyof typeof limits];
    if (!limit) throw new Error(`Unsupported platform: ${platform}`);

    const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Accept-Language': lang === 'ru' ? 'ru-RU,ru' : 'en-US,en',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'glm-4.7-flash',
        temperature: 0.9,
        top_p: 0.92,
        frequency_penalty: 0.2,
        presence_penalty: 0.25,
        messages: [{ role: 'user', content: buildPrompt(platform, lang, limit, text) }]
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) {
      throw new Error(`LLM request failed for ${platform} with status ${response.status}`);
    }

    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error(`LLM returned empty content for ${platform}`);

    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(content) as Record<string, string>;
    } catch {
      throw new Error(`LLM returned non-JSON response for ${platform}`);
    }

    const generated = normalizeText(parsed[platform]);
    if (!generated) throw new Error(`LLM missed platform: ${platform}`);
    result[platform] = trimToLimit(generated, limit);
  }

  return result;
};

export const DEMO_INPUT_LIMIT = 1800;
export const hasValidDemoInput = (text: string, lang: string) => Boolean(text) && text.length <= DEMO_INPUT_LIMIT && (lang === 'ru' || lang === 'en');
