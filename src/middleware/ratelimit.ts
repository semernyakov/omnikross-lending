// ════════════════════════════════════════════════════════════
// Rate Limiting Middleware
// In-memory token bucket (достаточно для MVP)
// ════════════════════════════════════════════════════════════

import type { Context, Next } from "hono";

interface RateLimitConfig {
  windowMs: number; // Временное окно (мс)
  maxRequests: number; // Максимум запросов в окне
}

class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly maxKeys: number;

  constructor(private config: RateLimitConfig, maxKeys: number = 10000) {
    this.maxKeys = maxKeys;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Получаем timestamps запросов для этого ключа
    let timestamps = this.requests.get(key) || [];

    // Удаляем старые timestamps (вне окна)
    timestamps = timestamps.filter((ts) => ts > windowStart);

    // Проверяем лимит
    if (timestamps.length >= this.config.maxRequests) {
      return false;
    }

    // Добавляем новый timestamp
    timestamps.push(now);
    this.requests.set(key, timestamps);

    return true;
  }

  // Очистка старых записей (запускается периодически)
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [key, timestamps] of this.requests.entries()) {
      const valid = timestamps.filter((ts) => ts > windowStart);

      if (valid.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, valid);
      }
    }

    // Защита от memory leak - удаляем самые старые ключи если превышен лимит
    if (this.requests.size > this.maxKeys) {
      const entries = Array.from(this.requests.entries());
      // Сортируем по времени последнего запроса и удаляем самые старые
      entries.sort((a, b) => {
        const aLast = Math.max(...a[1]);
        const bLast = Math.max(...b[1]);
        return aLast - bLast;
      });
      
      const toDelete = entries.slice(0, this.requests.size - this.maxKeys);
      toDelete.forEach(([key]) => this.requests.delete(key));
    }
  }
}

// ─── Конфигурации для разных endpoint'ов ───

const signupLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 минута
  maxRequests: 3, // Максимум 3 регистрации с одного IP в минуту
});

const apiLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30, // 30 запросов в минуту для /api/slots
});

// Очистка каждые 5 минут
setInterval(
  () => {
    signupLimiter.cleanup();
    apiLimiter.cleanup();
  },
  5 * 60 * 1000,
);

// ─── Middleware функции ───

export function rateLimitSignup() {
  return async (c: Context, next: Next) => {
    const realIp = c.req.header("x-real-ip");
    const forwardedFor = c.req.header("x-forwarded-for");
    const ip = (realIp || forwardedFor || "unknown") as string;

    if (!signupLimiter.isAllowed(ip)) {
      return c.json(
        {
          error: "Too many signup attempts. Please try again later.",
          retryAfter: 60,
        },
        429,
      );
    }

    await next();
  };
}

export function rateLimitAPI() {
  return async (c: Context, next: Next) => {
    const realIp = c.req.header("x-real-ip");
    const forwardedFor = c.req.header("x-forwarded-for");
    const ip = (realIp || forwardedFor || "unknown") as string;

    if (!apiLimiter.isAllowed(ip)) {
      return c.json(
        {
          error: "Rate limit exceeded",
          retryAfter: 60,
        },
        429,
      );
    }

    await next();
  };
}
