// ════════════════════════════════════════════════════════════
// Error Handling Utilities
// Retry logic и обработка временных сбоев БД
// ════════════════════════════════════════════════════════════

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 100,
  maxDelay: 1000,
  backoffFactor: 2,
};

export async function withRetry<T>(
  operation: () => T,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return operation();
    } catch (error) {
      lastError = error as Error;
      
      // Не retry для логических ошибок (вроде duplicate key)
      if (error instanceof Error && (
        error.message.includes('UNIQUE') ||
        error.message.includes('NOT NULL') ||
        error.message.includes('CHECK constraint')
      )) {
        throw error;
      }

      // Последняя попытка - пробрасываем ошибку
      if (attempt === finalConfig.maxRetries) {
        throw error;
      }

      // Экспоненциальный backoff с jitter
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffFactor, attempt),
        finalConfig.maxDelay
      );
      
      // Добавляем случайный jitter (±25%)
      const jitter = delay * 0.25 * (Math.random() * 2 - 1);
      const finalDelay = delay + jitter;

      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }

  throw lastError!;
}

export function isRetryableError(error: Error): boolean {
  // Временные ошибки SQLite
  return error.message.includes('database is locked') ||
         error.message.includes('busy') ||
         error.message.includes('timeout') ||
         error.message.includes('disk I/O error');
}
