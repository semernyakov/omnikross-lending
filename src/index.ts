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
  const row = db.prepare('SELECT value FROM config WHERE key = "remaining_slots"').get() as { value: string };
  return c.json({ 
    success: true, 
    remaining: parseInt(row.value) 
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
      db.prepare('INSERT INTO users (email, role) VALUES (?, ?)').run(email, role);
      db.run('UPDATE config SET value = CAST(value AS INTEGER) - 1 WHERE key = "remaining_slots"');
    });

    signupTransaction();

    return c.json({ success: true, message: 'Welcome to the future!' });
  } catch (err) {
    return c.json({ success: false, message: 'Validation failed' }, 400);
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