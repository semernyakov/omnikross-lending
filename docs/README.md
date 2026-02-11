# 🚀 OmniKross Landing — Production Ready MVP

Легковесный landing page для OmniKross с реальным backend API.

**Stack:** Bun + Hono + SQLite + Docker + Nginx

---

## 📊 Характеристики

| Метрика | Значение |
|---------|----------|
| **Docker Image** | ~90MB |
| **RAM Usage** | ~50-70MB |
| **Disk Space** | <100MB |
| **Response Time** | <20ms (API) |
| **Max Throughput** | ~5000 req/sec |
| **Database** | SQLite (до 100k записей) |

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────┐
│         Internet (HTTPS)                │
│    omnikross.ru / omnikross.com         │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│      Nginx (Rate Limit + SSL)           │
│   - Static files (HTML/CSS/JS)          │
│   - Proxy /api → :3000                  │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│   Docker Container (Alpine Linux)       │
│   ┌───────────────────────────────┐     │
│   │  Bun Runtime + Hono API       │     │
│   │  - POST /api/signup           │     │
│   │  - GET /api/slots             │     │
│   │  - GET /api/health            │     │
│   └───────────────┬───────────────┘     │
│                   │                     │
│                   ▼                     │
│   ┌───────────────────────────────┐     │
│   │  SQLite Database              │     │
│   │  (data/omnikross.db)          │     │
│   └───────────────────────────────┘     │
└─────────────────────────────────────────┘
```

---

## 📁 Структура проекта

```
omnikross-landing/
├── docker-compose.yml       # Оркестрация
├── Dockerfile              # Multi-stage build
├── package.json            # Bun dependencies
├── DEPLOY.md              # Инструкция по деплою
│
├── src/                   # Backend API (TypeScript)
│   ├── index.ts           # Hono API server
│   ├── db.ts              # SQLite layer
│   └── middleware/
│       └── ratelimit.ts   # Rate limiting
│
├── public/                # Frontend (статика)
│   ├── index_ru.html
│   ├── index_en.html
│   ├── css/
│   │   ├── styles.css
│   │   ├── animations.css
│   │   └── roi-calculator.css
│   ├── js/
│   │   ├── forms.js       # ✅ Обновлён (API integration)
│   │   ├── simulator.js
│   │   ├── roi-calculator.js
│   │   └── theme.js
│   └── assets/
│
├── nginx/                 # Nginx конфигурации
│   ├── omnikross.ru.conf
│   └── omnikross.com.conf
│
└── data/                  # SQLite database (volume)
    └── omnikross.db
```

---

## 🔑 Ключевые особенности

### Backend (Bun + Hono)
- ✅ **Ultra-fast:** 4x быстрее Node.js
- ✅ **Lightweight:** ~50MB RAM usage
- ✅ **Type-safe:** TypeScript из коробки
- ✅ **Single binary:** нет node_modules в production

### Database (SQLite)
- ✅ **Zero overhead:** нет отдельного процесса
- ✅ **Simple backup:** просто копирование файла
- ✅ **Sufficient:** до 100,000 пользователей
- ✅ **ACID compliant:** транзакции и prepared statements

### Security
- ✅ **Rate limiting:** 3 signup/мин, 30 API/мин
- ✅ **SQL injection safe:** prepared statements
- ✅ **CORS:** только для omnikross.ru/com
- ✅ **CSP headers:** Content Security Policy
- ✅ **HTTPS + HSTS:** SSL enforcement

### Frontend
- ✅ **Real API integration:** fetch вместо localStorage
- ✅ **Error handling:** network errors, validation
- ✅ **Progressive enhancement:** работает без JS
- ✅ **A/B testing:** два варианта CTA
- ✅ **Analytics ready:** Yandex.Metrica + GA4

---

## 🚀 Быстрый старт

### 1. Клонирование

```bash
git clone https://github.com/yourusername/omnikross-landing.git
cd omnikross-landing
```

### 2. Локальная разработка (с Bun)

```bash
# Установка Bun
curl -fsSL https://bun.sh/install | bash

# Установка зависимостей
bun install

# Запуск dev сервера
bun run dev

# Открыть http://localhost:3000
```

### 3. Production деплой

См. [DEPLOY.md](./DEPLOY.md) для полной инструкции.

**TL;DR:**
```bash
# На сервере
cd /var/www/omnikross-landing
docker-compose up -d --build

# Nginx конфиги
sudo ln -s $(pwd)/nginx/*.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d omnikross.ru -d omnikross.com
```

---

## 📡 API Endpoints

### `GET /api/health`
Healthcheck для мониторинга.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T12:34:56.789Z",
  "uptime": 123.45
}
```

### `GET /api/slots`
Текущее количество доступных слотов.

**Response:**
```json
{
  "remaining": 347,
  "total": 500,
  "filled": 153
}
```

### `POST /api/signup`
Регистрация нового пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "social": "@username",
  "lang": "ru"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "slotNumber": 154,
  "remaining": 346,
  "message": "Вы пионер #154!"
}
```

**Errors:**
- `400` — Invalid data
- `409` — Email already registered
- `410` — All slots taken
- `429` — Rate limit exceeded

---

## 🛠️ Разработка

### Локальный запуск

```bash
# Dev server (hot reload)
bun run dev

# Production mode
bun run start
```

### Тестирование API

```bash
# Health check
curl http://localhost:3000/api/health

# Get slots
curl http://localhost:3000/api/slots

# Test signup
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","social":"@test","lang":"ru"}'
```

### Database

```bash
# Инициализация (автоматически при первом запуске)
bun run db:init

# Прямой доступ к SQLite
sqlite3 data/omnikross.db

# Примеры запросов
SELECT COUNT(*) FROM signups;
SELECT * FROM signups ORDER BY created_at DESC LIMIT 10;
```

---

## 🔒 Безопасность

### Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/api/signup` | 3 req/min per IP |
| `/api/slots` | 30 req/min per IP |
| Static files | 100 req/min per IP |

### Headers

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: ...`

### Data Protection

- Email адреса хэшируются перед сохранением (опционально)
- IP адреса для аналитики (можно отключить)
- GDPR compliance ready

---

## 📊 Мониторинг

### Логи

```bash
# Docker logs
docker-compose logs -f

# Nginx access logs
sudo tail -f /var/log/nginx/omnikross.ru.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/omnikross.ru.error.log
```

### Метрики

```bash
# Количество регистраций
sqlite3 data/omnikross.db "SELECT COUNT(*) FROM signups;"

# Статистика по языкам
sqlite3 data/omnikross.db "SELECT lang, COUNT(*) FROM signups GROUP BY lang;"

# Последние регистрации
sqlite3 data/omnikross.db "SELECT email, slot_number, created_at FROM signups ORDER BY created_at DESC LIMIT 10;"
```

### Healthcheck

```bash
# Автоматический мониторинг (добавить в crontab)
*/5 * * * * curl -f http://localhost:3000/api/health || systemctl restart omnikross-landing
```

---

## 💾 Backup

### Автоматический backup (cron)

```bash
# Добавить в crontab -e:

# Ежедневный backup в 3:00
0 3 * * * cp /var/www/omnikross-landing/data/omnikross.db \
           /var/www/omnikross-landing/data/backup-$(date +\%Y\%m\%d).db

# Удаление старых backup'ов (>30 дней)
0 4 * * * find /var/www/omnikross-landing/data/backup-*.db -mtime +30 -delete
```

### Ручной backup

```bash
# Копирование БД
cp data/omnikross.db data/backup-$(date +%Y%m%d).db

# Экспорт в SQL
sqlite3 data/omnikross.db .dump > backup.sql

# Восстановление
sqlite3 data/omnikross.db < backup.sql
```

---

## 🔄 Обновление

```bash
cd /var/www/omnikross-landing

# Pull изменений
git pull origin main

# Rebuild контейнера
docker-compose down
docker-compose up -d --build

# Проверка
curl https://omnikross.ru/api/health
```

---

## 🐛 Troubleshooting

### Контейнер не запускается

```bash
# Проверка логов
docker-compose logs

# Проверка портов
sudo netstat -tlnp | grep 3000

# Restart
docker-compose restart
```

### 502 Bad Gateway

```bash
# Проверка API
curl http://localhost:3000/api/health

# Проверка nginx
sudo nginx -t

# Restart
docker-compose restart
sudo systemctl reload nginx
```

### База данных заблокирована

```bash
# Остановка контейнера
docker-compose down

# Удаление lock файлов
rm -f data/omnikross.db-wal data/omnikross.db-shm

# Перезапуск
docker-compose up -d
```

---

## 📈 Roadmap

- [ ] Admin dashboard для просмотра регистраций
- [ ] Email notifications (Resend/SendGrid)
- [ ] Экспорт в CSV
- [ ] Интеграция с CRM
- [ ] A/B тестирование через UI
- [ ] Real-time analytics dashboard

---

## 📝 License

MIT License — см. [LICENSE](LICENSE)

---

## 🤝 Contributing

Pull requests приветствуются! Для крупных изменений сначала создайте issue.

---

## 📞 Support

- **Email:** support@omnikross.com
- **Telegram:** [@omnikross](https://t.me/omnikross)
- **GitHub Issues:** [github.com/semernyakov/omnikross-landing/issues](https://github.com/semernyakov/omnikross-landing/issues)

---

**Made with ⚡ by OmniKross Team**
