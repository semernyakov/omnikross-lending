import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { secureHeaders } from 'hono/secure-headers';
import { randomUUID } from 'crypto';
import db, { initDb } from './db';
import { markRegistrationConfirmedInSupabase, syncRegistrationToSupabase } from './supabase';
import { adaptWithZAISequential, hasValidDemoInput, resolveSelectedPlatforms, type Lang } from './demo-adapter';

const app = new Hono();

const ALLOWED_ROLES = new Set(['agency', 'solo']);
const ALLOWED_LANGS = new Set(['ru', 'en']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_RE = /^@[a-zA-Z0-9_]{5,32}$/;
const PHONE_RE = /^\+?[0-9\s()\-]{7,20}$/;


type RegistrationPayload = {
  role: 'agency' | 'solo';
  lang: 'ru' | 'en';
  email: string;
  telegram?: string;
  phone?: string;
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
  const phone = normalizeText(raw.phone);
  const company = normalizeText(raw.company);
  const clientsCount = Number.parseInt(String(raw.clientsCount ?? ''), 10);

  if (!ALLOWED_ROLES.has(role) || !ALLOWED_LANGS.has(lang) || !EMAIL_RE.test(email)) throw new Error('VALIDATION');
  if (telegram && !TELEGRAM_RE.test(telegram)) throw new Error('VALIDATION');
  if (phone && !PHONE_RE.test(phone)) throw new Error('VALIDATION');
  if (role === 'agency' && !company) throw new Error('VALIDATION');

  return {
    role: role as 'agency' | 'solo',
    lang: lang as 'ru' | 'en',
    email,
    telegram: telegram || undefined,
    phone: phone || undefined,
    company: company || undefined,
    clientsCount: Number.isFinite(clientsCount) && clientsCount > 0 ? clientsCount : undefined
  };
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
      INSERT INTO registration (role, lang, email, telegram, phone, company, clients_count, confirm_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(data.role, data.lang, data.email, data.telegram ?? null, data.phone ?? null, data.company ?? null, data.clientsCount ?? null, token);

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
    const body = await c.req.json() as { text?: string; lang?: string; channels?: string[] };
    const text = normalizeText(body.text);
    const lang = (normalizeText(body.lang) || 'ru') as Lang;
    if (!hasValidDemoInput(text, lang)) return c.json({ success: false, message: 'Validation failed' }, 400);

    const selectedPlatforms = resolveSelectedPlatforms(lang as Lang, body.channels);
    const adaptations = await adaptWithZAISequential(text, lang as Lang, selectedPlatforms);
    return c.json({ success: true, adaptations });
  } catch (err) {
    console.error('Demo adapt error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return c.json({ success: false, message: `LLM unavailable: ${message}` }, 502);
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

app.use('*', serveStatic({ root: './dist' }));
app.get('*', serveStatic({ path: './dist/index.html' }));

const port = Number.parseInt(process.env.PORT ?? '3000', 10) || 3000;
console.log(`🚀 OmniKross Server running on port ${port}`);

export default { port, fetch: app.fetch };
