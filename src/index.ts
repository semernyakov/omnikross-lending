import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { z } from 'zod';
import db, { initDb } from './db';

const app = new Hono();

// Middleware
app.use('/api/*', cors());
initDb();

// Схема валидации лида
const SignupSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.string().min(1)
});

/**
 * API: Получить текущее кол-во свободных мест
 */
app.get('/api/slots', (c) => {
  const row = db.prepare('SELECT value FROM config WHERE key = "remaining_slots"').get() as { value: string } | undefined;
  const remaining = row ? Number.parseInt(row.value, 10) : 0;

  return c.json({
    success: true,
    remaining: Number.isFinite(remaining) ? Math.max(remaining, 0) : 0
  });
});

/**
 * API: Регистрация лида
 */
app.post('/api/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, role } = SignupSchema.parse(body);

    // Проверяем, не занят ли email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return c.json({ success: false, message: 'Already registered' }, 400);
    }

    // Транзакция: сохраняем юзера и уменьшаем счетчик слотов
    const signupTransaction = db.transaction(() => {
      const slotRow = db.prepare('SELECT value FROM config WHERE key = ?').get('remaining_slots') as { value: string } | undefined;
      const remainingSlots = slotRow ? Number.parseInt(slotRow.value, 10) : 0;

      if (!Number.isFinite(remainingSlots) || remainingSlots <= 0) {
        throw new Error('NO_SLOTS');
      }

      db.prepare('INSERT INTO users (email, role) VALUES (?, ?)').run(email, role);
      db.prepare('UPDATE config SET value = ? WHERE key = ?').run(String(remainingSlots - 1), 'remaining_slots');
    });

    signupTransaction();

    return c.json({ success: true, message: 'Welcome to the future!' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ success: false, message: 'Validation failed', errors: err.flatten() }, 400);
    }

    if (err instanceof Error && err.message === 'NO_SLOTS') {
      return c.json({ success: false, message: 'No slots available' }, 409);
    }

    console.error('Signup error:', err);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
});

/**
 * API: Healthcheck для Docker
 */
app.get('/api/health', (c) => c.json({ status: 'ok', uptime: process.uptime() }));

// Раздача статики (Production mode)
app.use('*', serveStatic({ root: './dist' }));
app.get('*', serveStatic({ path: './dist/index.html' }));

console.log(`🚀 OmniKross Server running on port ${process.env.PORT || 3000}`);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};