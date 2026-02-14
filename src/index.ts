import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { secureHeaders } from 'hono/secure-headers';
import db, { initDb } from './db';

const app = new Hono();

const ALLOWED_ROLES = new Set(['agency', 'solo', 'trader', 'founder']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const parseSignupPayload = (body: unknown) => {
  if (!body || typeof body !== 'object') {
    throw new Error('VALIDATION');
  }

  const raw = body as Record<string, unknown>;
  const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
  const role = typeof raw.role === 'string' ? raw.role.trim().toLowerCase() : '';

  if (!EMAIL_RE.test(email) || !ALLOWED_ROLES.has(role)) {
    throw new Error('VALIDATION');
  }

  return { email, role };
};

app.use('*', secureHeaders());
app.use('/api/*', cors());

initDb();

app.get('/api/slots', (c) => {
  const row = db.prepare('SELECT value FROM config WHERE key = ?').get('remaining_slots') as { value: string } | undefined;
  const raw = row ? Number.parseInt(row.value, 10) : 0;

  return c.json({
    success: true,
    remaining: Number.isFinite(raw) ? Math.max(raw, 0) : 0
  });
});

app.post('/api/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, role } = parseSignupPayload(body);

    const signupTransaction = db.transaction(() => {
      const slotRow = db.prepare('SELECT value FROM config WHERE key = ?').get('remaining_slots') as { value: string } | undefined;
      const remainingSlots = slotRow ? Number.parseInt(slotRow.value, 10) : 0;

      if (!Number.isFinite(remainingSlots) || remainingSlots <= 0) {
        throw new Error('NO_SLOTS');
      }

      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        throw new Error('ALREADY_REGISTERED');
      }

      db.prepare('INSERT INTO users (email, role) VALUES (?, ?)').run(email, role);
      db.prepare('UPDATE config SET value = ? WHERE key = ?').run(String(remainingSlots - 1), 'remaining_slots');
    });

    signupTransaction();

    return c.json({ success: true, message: 'Welcome to OmniKross!' }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'VALIDATION') {
      return c.json({ success: false, message: 'Validation failed' }, 400);
    }

    if (err instanceof Error && err.message === 'ALREADY_REGISTERED') {
      return c.json({ success: false, message: 'Already registered' }, 409);
    }

    if (err instanceof Error && err.message === 'NO_SLOTS') {
      return c.json({ success: false, message: 'No slots available' }, 409);
    }

    console.error('Signup error:', err);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
});

app.get('/api/health', (c) => c.json({ status: 'ok', uptime: process.uptime() }));

app.use('/css/*', serveStatic({ root: './dist' }));
app.use('*', serveStatic({ root: './public' }));
app.get('*', serveStatic({ path: './public/index.html' }));

const port = Number.parseInt(process.env.PORT ?? '3000', 10) || 3000;
console.log(`🚀 OmniKross Server running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
