import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { z } from 'zod'
import db from './db'

// Validation schemas
const SignupSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.string().min(1, 'Role is required'),
  platform: z.string().min(1, 'Platform is required'),
})

type SignupData = z.infer<typeof SignupSchema>

const app = new Hono()

// Security headers middleware
app.use('*', async (c, next) => {
  c.header('X-Frame-Options', 'DENY')
  c.header('Content-Security-Policy', "frame-ancestors 'none'")
  await next()
})

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json(
    {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    500
  )
})

// Request validation middleware
const validateSignup = async (c: any, next: any) => {
  try {
    const body = await c.req.json()
    const validatedData = SignupSchema.parse(body)
    ;(c as any).set('validatedData', validatedData)
    await next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          message: 'Validation failed',
          errors: (error as any).errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        400
      )
    }
    return c.json({ success: false, message: 'Invalid request format' }, 400)
  }
}

// API: Get Slot Count
app.get('/api/slots', c => {
  try {
    const totalRow = db.prepare('SELECT value FROM config WHERE key = "total_slots"').get() as {
      value: string
    } | null

    if (!totalRow) {
      return c.json({ success: false, message: 'Configuration error: total_slots not found' }, 500)
    }

    const total = parseInt(totalRow.value)
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as {
      count: number
    } | null

    if (!userCount) {
      return c.json({ success: false, message: 'Database error: unable to count users' }, 500)
    }

    const remaining = total - userCount.count
    const filled = userCount.count

    return c.json({
      success: true,
      data: {
        total,
        remaining,
        filled,
        percentage: Math.round((filled / total) * 100),
      },
      message: 'Slots data retrieved successfully',
    })
  } catch (error) {
    console.error('Slots API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json(
      {
        success: false,
        message: 'Failed to retrieve slots data',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      500
    )
  }
})

// API: Handle Signup
app.post('/api/signup', validateSignup, async c => {
  try {
    const formData = (c as any).get('validatedData') as SignupData

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(formData.email) as {
      id: number
    } | null
    if (existing) {
      return c.json(
        { success: false, message: 'Email already registered!' },
        409 // Conflict status code
      )
    }

    // Get current slot counts with proper null checks
    const totalRow = db.prepare('SELECT value FROM config WHERE key = "total_slots"').get() as {
      value: string
    } | null

    if (!totalRow) {
      return c.json({ success: false, message: 'Configuration error: total_slots not found' }, 500)
    }

    const total = parseInt(totalRow.value)
    const remainingCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as {
      count: number
    } | null

    if (!remainingCount) {
      return c.json({ success: false, message: 'Database error: unable to count users' }, 500)
    }

    const remaining = total - remainingCount.count

    if (remaining <= 0) {
      return c.json({ success: false, message: 'No slots available.' }, 400)
    }

    // Use transaction for atomic operations
    const transaction = db.transaction(() => {
      const result = db
        .prepare('INSERT INTO users (email, role, platform) VALUES (?, ?, ?)')
        .run(formData.email, formData.role, formData.platform)

      db.prepare(
        'UPDATE config SET value = CAST(value AS INTEGER) - 1 WHERE key = "total_slots"'
      ).run()

      return result
    })

    const result = transaction()

    return c.json({
      success: true,
      message: 'Successfully registered!',
      data: {
        userId: result.lastInsertRowid,
        remaining: remaining - 1,
        email: formData.email,
      },
    })
  } catch (error) {
    console.error('Signup Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json(
      {
        success: false,
        message: 'Registration failed. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      500
    )
  }
})

// API: Health Check
app.get('/api/health', c => {
  try {
    // Check database connection
    const dbCheck = db.prepare('SELECT 1 as test').get() as { test: number } | null

    if (!dbCheck || dbCheck.test !== 1) {
      return c.json(
        {
          status: 'unhealthy',
          message: 'Database connection failed',
          timestamp: new Date().toISOString(),
        },
        503
      )
    }

    return c.json({
      status: 'healthy',
      message: 'Service is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime?.() || 0,
    })
  } catch (error) {
    console.error('Health Check Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json(
      {
        status: 'unhealthy',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      503
    )
  }
})

app.use('*', serveStatic({ root: './public' }))
app.get('*', serveStatic({ path: './public/index.html', root: './' }))

console.log('Server is running on port 3001 with SQLite')
export default {
  port: 3001,
  fetch: app.fetch,
}
