import { afterEach, describe, expect, it, mock } from 'bun:test';
import { adaptWithZAISequential, resolveSelectedPlatforms, trimToLimit } from '../src/demo-adapter';

describe('demo-adapter', () => {
  const originalKey = process.env.ZAI_API_KEY;
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    process.env.ZAI_API_KEY = originalKey;
    globalThis.fetch = originalFetch;
    mock.restore();
  });

  it('maps selected channels correctly', () => {
    expect(resolveSelectedPlatforms('ru', ['VK', 'Telegram'])).toEqual(['vk', 'telegram']);
    expect(resolveSelectedPlatforms('en', ['LinkedIn', 'Reddit'])).toEqual(['linkedin', 'reddit']);
  });

  it('trims text to hard limit', () => {
    const value = trimToLimit('x'.repeat(8), 5);
    expect(value.length).toBe(5);
  });

  it('executes sequential per-platform requests', async () => {
    process.env.ZAI_API_KEY = 'test-key';

    const order: string[] = [];
    globalThis.fetch = mock(async (_url: string, options?: RequestInit) => {
      const body = JSON.parse(String(options?.body ?? '{}'));
      const prompt = body.messages?.[0]?.content as string;
      const platform = (prompt.match(/\{"(.*?)":/)?.[1] ?? 'unknown').toLowerCase();
      order.push(platform);

      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ [platform]: `text for ${platform}` }) } }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }) as typeof fetch;

    const result = await adaptWithZAISequential('hello', 'en', ['linkedin', 'reddit']);

    expect(order).toEqual(['linkedin', 'reddit']);
    expect(result.linkedin).toContain('text for linkedin');
    expect(result.reddit).toContain('text for reddit');
  });
});
