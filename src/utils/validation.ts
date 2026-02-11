// ════════════════════════════════════════════════════════════
// Shared Validation Patterns
// Используется на backend и frontend для консистентности
// ════════════════════════════════════════════════════════════

export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  socialRu: /^@[\w\u0400-\u04FF]{2,}$/i,
  socialEn: /^@[\w]{2,}$/i,
};

export const VALIDATION_LIMITS = {
  email: {
    maxLength: 254,
  },
  social: {
    maxLength: 100,
  },
};

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > VALIDATION_LIMITS.email.maxLength) return false;
  return VALIDATION_PATTERNS.email.test(email);
}

export function validateSocial(value: string, lang: 'ru' | 'en'): boolean {
  if (!value || typeof value !== 'string') return false;
  if (value.length > VALIDATION_LIMITS.social.maxLength) return false;
  
  const pattern = lang === 'ru' ? VALIDATION_PATTERNS.socialRu : VALIDATION_PATTERNS.socialEn;
  return pattern.test(value);
}

export function sanitizeSocial(value: string | null): string | null {
  if (!value || typeof value !== 'string') return null;
  return value.trim().substring(0, VALIDATION_LIMITS.social.maxLength);
}
