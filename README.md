# OmniKross Landing

Инструкция по запуску (Bun + Hono + SQLite + optional z.ai + optional Supabase).

## 1) Требования
- Bun >= 1.2
- (опционально) Docker + Docker Compose

## 2) Переменные окружения
Скопируйте шаблон:

```bash
cp .env.example .env
```

Минимум для локального запуска:
- `PORT=3000`
- `MAX_SIGNUPS=500`

Опционально для AI-адаптации:
- `ZAI_API_KEY=...`

Опционально для синхронизации регистраций в Supabase:
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`

> Не коммитьте `.env` в git.

## 3) Локальный запуск
Установка зависимостей:

```bash
bun install
```

Сборка стилей:

```bash
bun run build
```

Запуск сервера:

```bash
bun run start
```

Приложение будет доступно на: `http://127.0.0.1:3000`

## 4) Проверка после запуска
Health:

```bash
curl http://127.0.0.1:3000/api/health
```

Slots:

```bash
curl http://127.0.0.1:3000/api/slots
```

## 5) Запуск через Docker Compose
Убедитесь, что переменные окружения заданы в shell/CI (`ZAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` при необходимости).

```bash
docker compose up --build -d
```

Проверка:

```bash
curl http://127.0.0.1:3000/api/health
```

Остановка:

```bash
docker compose down
```

## 6) Основные роуты интерфейса
- `/` — выбор роли
- `/ru/agency.html`
- `/ru/solo.html`
- `/en/agency.html`
- `/en/solo.html`
- `/confirm.html?token=...` — подтверждение регистрации
