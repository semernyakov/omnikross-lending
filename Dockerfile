FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
COPY src ./src
COPY public ./public

RUN bun install
RUN bun run build:css

RUN mkdir -p /app/data && chown -R bun:bun /app

USER bun

ENV NODE_ENV=production
ENV TZ=Europe/Moscow
ENV PORT=3000
ENV ZAI_API_KEY=""
ENV SUPABASE_URL=""
ENV SUPABASE_SERVICE_ROLE_KEY=""

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

EXPOSE 3000

CMD ["bun", "run", "start"]
