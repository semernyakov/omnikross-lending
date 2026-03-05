import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { secureHeaders } from 'hono/secure-headers';
import { randomUUID } from 'crypto';
import db, { initDb } from './db';
import { markRegistrationConfirmedInSupabase, syncRegistrationToSupabase } from './supabase';

const app = new Hono();

const ALLOWED_ROLES = new Set(['agency', 'solo']);
const ALLOWED_LANGS = new Set(['ru', 'en']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_RE = /^@[a-zA-Z0-9_]{5,32}$/;

const PLATFORM_LIMITS = {
  ru: { vk: 2200, ok: 1200, telegram: 1024, max: 600, habr: 3000 },
  en: { linkedin: 3000, x: 280, instagram: 2200, tiktok: 2200, reddit: 4000 }
} as const;

type Lang = keyof typeof PLATFORM_LIMITS;

type RegistrationPayload = {
  role: 'agency' | 'solo';
  lang: 'ru' | 'en';
  email: string;
  telegram?: string;
  company?: string;
  clientsCount?: number;
};

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const parseRegistrationPayload = (body: unknown): RegistrationPayload => {
  if (!body || typeof body !== 'object') throw new Error('VALIDATION');
  const raw = body as Record<string, unknown>;

  const role = normalizeText(raw.role).toLowerCase();
  const lang = normalizeText(raw.lang).toLowerCase();
  const email = normalizeText(raw.email).toLowerCase();
  const telegram = normalizeText(raw.telegram);
  const company = normalizeText(raw.company);
  const clientsCount = Number.parseInt(String(raw.clientsCount ?? ''), 10);

  if (!ALLOWED_ROLES.has(role) || !ALLOWED_LANGS.has(lang) || !EMAIL_RE.test(email)) throw new Error('VALIDATION');
  if (telegram && !TELEGRAM_RE.test(telegram)) throw new Error('VALIDATION');
  if (role === 'agency' && !company) throw new Error('VALIDATION');

  return {
    role: role as 'agency' | 'solo',
    lang: lang as 'ru' | 'en',
    email,
    telegram: telegram || undefined,
    company: company || undefined,
    clientsCount: Number.isFinite(clientsCount) && clientsCount > 0 ? clientsCount : undefined
  };
};

const trimToLimit = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(limit - 1, 1)).trimEnd()}…`;
};

const fallbackAdapt = (text: string, lang: Lang) => {
  const limits = PLATFORM_LIMITS[lang];
  return Object.fromEntries(Object.entries(limits).map(([platform, limit]) => [platform, trimToLimit(`[${platform.toUpperCase()}] ${text}`, limit)]));
};

const adaptWithZAI = async (text: string, lang: Lang) => {
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) return fallbackAdapt(text, lang);

  const limits = PLATFORM_LIMITS[lang];
  const prompt = `Return only strict JSON. Keys: ${Object.keys(limits).join(', ')}. Keep each output within limits: ${JSON.stringify(limits)}. Source: ${text}`;

  const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Accept-Language': lang === 'ru' ? 'ru-RU' : 'en-US,en',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: 'glm-4.7-flash', messages: [{ role: 'user', content: prompt }] })
  });

  if (!response.ok) return fallbackAdapt(text, lang);

  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) return fallbackAdapt(text, lang);

  try {
    const parsed = JSON.parse(content) as Record<string, string>;
    const result: Record<string, string> = {};
    for (const [platform, limit] of Object.entries(limits)) result[platform] = trimToLimit(normalizeText(parsed[platform]) || text, limit);
    return result;
  } catch {
    return fallbackAdapt(text, lang);
  }
};

const sendConfirmationEmail = async (email: string, link: string) => {
  console.log(`📧 Confirmation link for ${email}: ${link}`);
};

const sendThankYouEmail = async (email: string) => {
  console.log(`📧 Thank-you email for ${email}: Thank you for confirming your registration with OmniKross.`);
};

app.use('*', secureHeaders());
app.use('/api/*', cors());

initDb();

app.get('/api/slots', (c) => {
  const maxSignups = Number.parseInt(process.env.MAX_SIGNUPS ?? '500', 10) || 500;
  const used = (db.prepare('SELECT COUNT(*) as count FROM registration').get() as { count: number }).count;
  return c.json({ success: true, remaining: Math.max(maxSignups - used, 0), max: maxSignups, used });
});

app.post('/api/register-interest', async (c) => {
  try {
    const body = await c.req.json();
    const data = parseRegistrationPayload(body);

    const maxSignups = Number.parseInt(process.env.MAX_SIGNUPS ?? '500', 10) || 500;
    const used = (db.prepare('SELECT COUNT(*) as count FROM registration').get() as { count: number }).count;
    if (used >= maxSignups) return c.json({ success: false, message: 'No slots available' }, 409);

    const existing = db.prepare('SELECT is_confirmed FROM registration WHERE email = ?').get(data.email) as { is_confirmed: number } | undefined;
    if (existing) {
      return c.json({ success: false, message: existing.is_confirmed ? 'Email already confirmed' : 'Email already registered, please confirm from your inbox' }, 409);
    }

    const token = randomUUID();
    db.prepare(`
      INSERT INTO registration (role, lang, email, telegram, company, clients_count, confirm_token)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(data.role, data.lang, data.email, data.telegram ?? null, data.company ?? null, data.clientsCount ?? null, token);

    await syncRegistrationToSupabase({ ...data, confirmToken: token });

    const origin = new URL(c.req.url).origin;
    const link = `${origin}/confirm.html?token=${token}`;
    await sendConfirmationEmail(data.email, link);

    return c.json({ success: true, message: 'Check your email to confirm registration.', confirmationLink: link }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'VALIDATION') return c.json({ success: false, message: 'Validation failed' }, 400);
    console.error('Registration error:', err);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
});

app.post('/api/confirm-registration', async (c) => {
  try {
    const body = await c.req.json() as { token?: string };
    const token = normalizeText(body.token);
    if (!token) return c.json({ success: false, message: 'Token required' }, 400);

    const existing = db.prepare('SELECT id, email, is_confirmed FROM registration WHERE confirm_token = ?').get(token) as { id: number; email: string; is_confirmed: number } | undefined;
    if (!existing) return c.json({ success: false, message: 'Invalid token' }, 404);

    if (existing.is_confirmed === 1) return c.json({ success: true, message: 'Already confirmed' });

    db.prepare('UPDATE registration SET is_confirmed = 1, confirmed_at = CURRENT_TIMESTAMP WHERE id = ?').run(existing.id);
    await markRegistrationConfirmedInSupabase(token);
    await sendThankYouEmail(existing.email);

    return c.json({ success: true, message: 'Registration confirmed. Thank you email sent.' });
  } catch (err) {
    console.error('Confirm error:', err);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
});

app.post('/api/demo-adapt', async (c) => {
  try {
    const body = await c.req.json() as { text?: string; lang?: string };
    const text = normalizeText(body.text);
    const lang = (normalizeText(body.lang) || 'ru') as Lang;
    if (!text || !(lang in PLATFORM_LIMITS)) return c.json({ success: false, message: 'Validation failed' }, 400);

    const adaptations = await adaptWithZAI(text, lang);
    return c.json({ success: true, adaptations });
  } catch (err) {
    console.error('Demo adapt error:', err);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
});

app.get('/api/health', (c) => c.json({
  status: 'ok',
  uptime: process.uptime(),
  storage: {
    localDb: 'registration',
    supabaseEnabled: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  }
}));

app.use('/css/*', serveStatic({ root: './dist' }));
app.use('*', serveStatic({ root: './public' }));
app.get('*', serveStatic({ path: './public/index.html' }));

const port = Number.parseInt(process.env.PORT ?? '3000', 10) || 3000;
console.log(`🚀 OmniKross Server running on port ${port}`);

export default { port, fetch: app.fetch };
