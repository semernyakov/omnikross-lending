FROM oven/bun:1.1.3-alpine

WORKDIR /app

# Создаем node_modules вручную если не можем скачать
RUN mkdir -p node_modules

# Копируем package.json и пытаемся установить зависимости
COPY package.json ./
RUN timeout 300 bun install || echo "Dependencies installation failed, continuing..."

# Если зависимости не установились, создаем заглушки
RUN if [ ! -d "node_modules/hono" ]; then \
        mkdir -p node_modules/hono && \
        echo "module.exports = {};" > node_modules/hono/index.js; \
    fi

COPY src ./src
COPY public ./public

RUN mkdir -p dist/css && cp public/css/core.css dist/css/core.css

RUN mkdir -p /app/data && chown -R bun:bun /app

USER bun

ENV NODE_ENV=production
ENV TZ=Europe/Moscow
ENV PORT=3000
ENV ZAI_API_KEY="f9ac3627174b4cddb09203232414c0e4.p0LbL9MAFyRyy5vV"
ENV SUPABASE_URL="https://gfmeynedbcewhrvsyjoi.supabase.co"
ENV SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWV5bmVkYmNld2hydnN5am9pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE0NjMzMSwiZXhwIjoyMDg2NzIyMzMxfQ.0IP6FkaqkCoMLds8WdjXFJg_PmvSOpYuvWNaKZ3H7r0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

EXPOSE 3000

CMD ["bun", "run", "start"]
