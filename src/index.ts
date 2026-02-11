// ════════════════════════════════════════════════════════════
// OmniKross Landing API
// Bun + Hono + SQLite
// Endpoints: /api/signup, /api/slots, /api/health
// ════════════════════════════════════════════════════════════

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { queries } from "./db";
import { rateLimitSignup, rateLimitAPI } from "./middleware/ratelimit";
import { validateEmail, validateSocial, sanitizeSocial } from "./utils/validation";
import { withRetry } from "./utils/errors";

const app = new Hono();

const MAX_SIGNUPS = parseInt(process.env.MAX_SIGNUPS || "500", 10);
const ALLOWED_ORIGINS = [
  "https://omnikross.ru",
  "https://www.omnikross.ru",
  "https://omnikross.com",
  "https://www.omnikross.com",
];

// Add localhost for development
if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.push("http://localhost:3000", "http://127.0.0.1:3000");
}

// ═══ Middleware ═══

// Логирование запросов
app.use("*", logger());

// CORS для обоих доменов
app.use(
  "/api/*",
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  }),
);

// ═══ API Routes ═══

// Health check (для Docker healthcheck и мониторинга)
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// GET /api/slots — текущее количество оставшихся слотов
app.get("/api/slots", rateLimitAPI(), async (c) => {
  try {
    const totalSignups = await withRetry(() => queries.getSignupCount());
    const remaining = Math.max(0, MAX_SIGNUPS - totalSignups);

    return c.json({
      remaining,
      total: MAX_SIGNUPS,
      filled: totalSignups,
    });
  } catch (err) {
    console.error("Error fetching slots:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /api/signup — регистрация нового пользователя
app.post("/api/signup", rateLimitSignup(), async (c) => {
  try {
    const body = await c.req.json();
    const { email, social, lang } = body;

    // ─── Валидация ───

    // Email
    if (!email || !validateEmail(email)) {
      return c.json({ error: "Invalid email format" }, 400);
    }

    // Social handle (опционально)
    const sanitizedSocial = sanitizeSocial(social);
    if (social && !validateSocial(social, lang as 'ru' | 'en')) {
      return c.json({ error: "Invalid social handle format" }, 400);
    }

    // Lang
    if (!lang || !["ru", "en"].includes(lang)) {
      return c.json({ error: "Invalid language" }, 400);
    }

    // ─── Проверка лимита слотов ───

    const currentSignups = await withRetry(() => queries.getSignupCount());
    if (currentSignups >= MAX_SIGNUPS) {
      return c.json(
        {
          error: "All slots have been taken",
          remaining: 0,
        },
        410,
      ); // 410 Gone
    }

    // ─── Получение метаданных ───

    const realIp = c.req.header("x-real-ip");
    const forwardedForHeader = c.req.header("x-forwarded-for");
    const ip = (realIp ||
      forwardedForHeader?.split(",")[0] ||
      "unknown") as string;

    const userAgent = (c.req.header("user-agent") || "unknown") as string;

    // ─── Сохранение в БД ───

    const result = await withRetry(() => 
      queries.createSignup(
        email.toLowerCase().trim(),
        sanitizedSocial,
        lang,
        ip,
        userAgent,
      )
    );

    if (!result.success) {
      return c.json({ error: result.error }, 409); // 409 Conflict
    }

    // ─── Успешный ответ ───

    const remaining = MAX_SIGNUPS - (currentSignups + 1);

    console.log(
      `✅ New signup: ${email} (slot #${result.slotNumber}, ${lang})`,
    );

    return c.json(
      {
        success: true,
        slotNumber: result.slotNumber,
        remaining,
        message:
          lang === "ru"
            ? `Вы пионер #${result.slotNumber}!`
            : `You're pioneer #${result.slotNumber}!`,
      },
      201,
    );
  } catch (err) {
    console.error("Signup error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ═══ Static Files (для standalone запуска без nginx) ═══

// Serve static files from public directory
app.use("/*", serveStatic({ root: "./public" }));

// Fallback to index.html (для SPA routing)
app.get(
  "*",
  serveStatic({
    path: "./public/index.html",
  }),
);

// ═══ Export для Bun runtime ═══

export default {
  port: parseInt(process.env.PORT || "3000", 10),
  fetch: app.fetch,
};

console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 OmniKross Landing API                                 ║
║  Port: ${process.env.PORT || "3000"}                      ║
║  Env: ${process.env.NODE_ENV || "development"}            ║
║  Max Signups: ${MAX_SIGNUPS}                              ║
╚═══════════════════════════════════════════════════════════╝
`);
