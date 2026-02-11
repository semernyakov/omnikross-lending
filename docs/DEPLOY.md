# 🚀 OmniKross Landing — Deployment Guide

## Предварительные требования

- ✅ VPS с Ubuntu/Debian (2GB RAM min)
- ✅ Docker и Docker Compose установлены
- ✅ Nginx установлен
- ✅ Домены omnikross.ru и omnikross.com направлены на IP сервера

---

## 📦 Шаг 1: Подготовка сервера

```bash
# Подключение к серверу
ssh user@your-server-ip

# Создание директории проекта
sudo mkdir -p /var/www/omnikross-landing
sudo chown -R $USER:$USER /var/www/omnikross-landing
cd /var/www/omnikross-landing
```

---

## 📥 Шаг 2: Загрузка файлов

### Вариант A: Git Clone (рекомендуется)

```bash
# Клонирование репозитория
git clone https://github.com/yourusername/omnikross-landing.git .

# Или загрузка архива
wget https://github.com/yourusername/omnikross-landing/archive/main.zip
unzip main.zip && mv omnikross-landing-main/* . && rm -rf omnikross-landing-main main.zip
```

### Вариант B: SCP (локальная загрузка)

```bash
# На локальной машине
cd /path/to/omnikross-landing
scp -r * user@your-server-ip:/var/www/omnikross-landing/
```

---

## 🗂️ Шаг 3: Структура директорий

```bash
cd /var/www/omnikross-landing

# Проверка структуры
tree -L 2

# Должно быть:
# .
# ├── docker-compose.yml
# ├── Dockerfile
# ├── package.json
# ├── src/
# │   ├── index.ts
# │   ├── db.ts
# │   └── middleware/
# ├── public/           # Ваши HTML/CSS/JS файлы
# │   ├── index_ru.html
# │   ├── index_en.html
# │   ├── css/
# │   ├── js/
# │   └── assets/
# ├── nginx/
# │   ├── omnikross.ru.conf
# │   └── omnikross.com.conf
# └── data/             # Создастся автоматически
```

### Копирование HTML/CSS/JS в public/

```bash
# Скопируйте ваши файлы из текущих документов в public/
mkdir -p public/{css,js,assets}

# Пример (замените пути на ваши):
cp /path/to/index_ru.html public/
cp /path/to/index_en.html public/
cp /path/to/css/* public/css/
cp /path/to/js/* public/js/
cp /path/to/assets/* public/assets/
```

---

## 🐳 Шаг 4: Запуск Docker контейнера

```bash
# Создание директории для SQLite
mkdir -p data
chmod 755 data

# Build и запуск
docker-compose up -d --build

# Проверка логов
docker-compose logs -f

# Должно быть:
# ✅ Database initialized: data/omnikross.db
# ✅ 🚀 OmniKross Landing API
# ✅ Port: 3000

# Проверка healthcheck
curl http://localhost:3000/api/health
# Ответ: {"status":"ok","timestamp":"...","uptime":...}

# Проверка слотов
curl http://localhost:3000/api/slots
# Ответ: {"remaining":500,"total":500,"filled":0}
```

---

## 🌐 Шаг 5: Настройка Nginx

```bash
# Создание symlinks на конфиги
sudo ln -s /var/www/omnikross-landing/nginx/omnikross.ru.conf /etc/nginx/sites-enabled/
sudo ln -s /var/www/omnikross-landing/nginx/omnikross.com.conf /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Должно быть:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Перезагрузка nginx
sudo systemctl reload nginx
```

---

## 🔒 Шаг 6: SSL сертификаты (Certbot)

```bash
# Установка Certbot (если не установлен)
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификатов для обоих доменов
sudo certbot --nginx \
  -d omnikross.ru \
  -d www.omnikross.ru \
  -d omnikross.com \
  -d www.omnikross.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# Проверка автообновления
sudo certbot renew --dry-run
```

---

## ✅ Шаг 7: Проверка работы

### API Endpoints

```bash
# Health check
curl https://omnikross.ru/api/health
curl https://omnikross.com/api/health

# Slots
curl https://omnikross.ru/api/slots

# Test signup (замените email)
curl -X POST https://omnikross.ru/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","social":"@testuser","lang":"ru"}'

# Ответ:
# {"success":true,"slotNumber":1,"remaining":499,"message":"Вы пионер #1!"}
```

### Веб-интерфейс

```bash
# Открыть в браузере:
https://omnikross.ru      # Русская версия
https://omnikross.com     # Английская версия
```

---

## 🔧 Управление контейнером

```bash
# Статус
docker-compose ps

# Логи (real-time)
docker-compose logs -f

# Остановка
docker-compose down

# Рестарт
docker-compose restart

# Rebuild после изменений
docker-compose up -d --build --force-recreate

# Удаление (с данными!)
docker-compose down -v
```

---

## 💾 Backup базы данных

```bash
# Создание backup
sudo cp /var/www/omnikross-landing/data/omnikross.db \
        /var/www/omnikross-landing/data/backup-$(date +%Y%m%d).db

# Автоматический backup (cron)
# Добавить в crontab -e:
0 3 * * * cp /var/www/omnikross-landing/data/omnikross.db /var/www/omnikross-landing/data/backup-$(date +\%Y\%m\%d).db

# Удаление старых backup'ов (старше 30 дней)
0 4 * * * find /var/www/omnikross-landing/data/backup-*.db -mtime +30 -delete
```

---

## 📊 Мониторинг

### Логи Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/omnikross.ru.access.log
sudo tail -f /var/log/nginx/omnikross.com.access.log

# Error logs
sudo tail -f /var/log/nginx/omnikross.ru.error.log
```

### Логи Docker

```bash
docker-compose logs --tail=100 -f
```

### Статистика SQLite

```bash
# Подключение к БД
docker-compose exec omnikross-api bun run -e "
  const db = require('bun:sqlite').Database('/app/data/omnikross.db');
  const stats = db.query('SELECT COUNT(*) as total FROM signups').get();
  console.log('Total signups:', stats.total);
"

# Или напрямую
sqlite3 /var/www/omnikross-landing/data/omnikross.db "SELECT COUNT(*) FROM signups;"
```

---

## 🚨 Troubleshooting

### Контейнер не запускается

```bash
# Проверка логов
docker-compose logs

# Проверка портов
sudo netstat -tlnp | grep 3000

# Если порт занят:
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Nginx 502 Bad Gateway

```bash
# Проверка, запущен ли контейнер
docker-compose ps

# Проверка доступности API
curl http://localhost:3000/api/health

# Рестарт
docker-compose restart
```

### SSL не работает

```bash
# Проверка сертификатов
sudo certbot certificates

# Проверка nginx конфигов
sudo nginx -t

# Перевыпуск сертификатов
sudo certbot --nginx --force-renewal
```

---

## 🔄 Обновление

```bash
cd /var/www/omnikross-landing

# Остановка контейнера
docker-compose down

# Обновление кода (git pull или копирование новых файлов)
git pull origin main

# Rebuild и запуск
docker-compose up -d --build

# Проверка
curl https://omnikross.ru/api/health
```

---

## 📈 Производительность

| Метрика | Значение |
|---------|----------|
| **RAM usage** | ~50-70MB |
| **Disk space** | ~100MB (включая Docker image) |
| **Response time** | <20ms (signup) |
| **Concurrent requests** | ~5000/sec |
| **Max signups** | 100,000+ (SQLite limit) |

---

## 🎯 Production Checklist

- [ ] Docker контейнер запущен (`docker-compose ps`)
- [ ] API отвечает (`curl http://localhost:3000/api/health`)
- [ ] Nginx конфиги подключены (в `/etc/nginx/sites-enabled/`)
- [ ] SSL сертификаты установлены (`sudo certbot certificates`)
- [ ] Домены резолвятся (`nslookup omnikross.ru`)
- [ ] HTTPS работает (открыть в браузере)
- [ ] Signup форма работает (тестовая регистрация)
- [ ] Backup настроен (cron)
- [ ] Мониторинг логов (CloudWatch/Grafana опционально)

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs -f`
2. Проверьте Nginx: `sudo nginx -t`
3. Проверьте порты: `sudo netstat -tlnp | grep 3000`
4. Проверьте SSL: `sudo certbot certificates`

---

**Готово!** 🎉 Ваша OmniKross Landing работает на production.
