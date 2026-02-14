# OmniKross Landing API Documentation

## Overview

Lightweight API for OmniKross landing page with slot-based signup system built with Bun + Hono + SQLite.

## Base URL

```text
Development: http://localhost:3000
Production: https://your-domain.com
```

## Endpoints

### Health Check

**GET** `/api/health`

Check if the service is running and database is accessible.

**Response:**

```json
{
  "status": "healthy",
  "message": "Service is running",
  "timestamp": "2026-02-14T10:30:00.000Z",
  "uptime": 3600
}
```

**Status Codes:**

- `200` - Service is healthy
- `503` - Service is unhealthy

---

### Get Slots Information

**GET** `/api/slots`

Retrieve current slot availability information.

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 500,
    "remaining": 250,
    "filled": 250,
    "percentage": 50
  },
  "message": "Slots data retrieved successfully"
}
```

**Status Codes:**

- `200` - Data retrieved successfully
- `500` - Server error

---

### User Signup

**POST** `/api/signup`

Register a new user for the slot-based system.

**Request Body:**

```json
{
  "email": "user@example.com",
  "role": "agency",
  "platform": "vk"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully registered!",
  "data": {
    "userId": 123,
    "remaining": 249,
    "email": "user@example.com"
  }
}
```

**Status Codes:**

- `200` - Registration successful
- `400` - Validation error
- `409` - Email already registered
- `500` - Server error

**Validation Errors:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

## Rate Limiting

- No rate limiting currently implemented
- Consider implementing for production use

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  platform TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Config Table

```sql
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

### Docker

```bash
# Build and run with Docker Compose
docker compose up --build

# Or build and run manually
docker build -t omnikross-api .
docker run -p 3000:3000 -v $(pwd)/data:/app/data omnikross-api
```

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `TZ` - Timezone (default: Europe/Moscow)
- `PORT` - Server port (default: 3000)
- `MAX_SIGNUPS` - Maximum number of signups (default: 500)

## Security Considerations

- Input validation with Zod schemas
- SQL injection prevention with prepared statements
- Email format validation
- Proper error handling without sensitive information exposure

## Monitoring

- Health check endpoint for monitoring
- Structured error logging
- Graceful shutdown handling
- Database connection monitoring

## Future Improvements

- Rate limiting implementation
- API key authentication
- Request/response caching
- Database connection pooling
- Comprehensive test suite
- OpenAPI/Swagger documentation integration
