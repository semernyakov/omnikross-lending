import { OpenAPIHono } from '@hono/zod-openapi'
import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'

const app = new OpenAPIHono()

// OpenAPI documentation
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'OmniKross Landing API',
    description: 'API for OmniKross landing page with slot-based signup system',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
})

// Health check route
const healthRoute = createRoute({
  method: 'get',
  path: '/api/health',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.string(),
            message: z.string(),
            timestamp: z.string(),
            uptime: z.number(),
          }),
        },
      },
      description: 'Health check response',
    },
    503: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.string(),
            message: z.string(),
            timestamp: z.string(),
          }),
        },
      },
      description: 'Service unhealthy',
    },
  },
})

app.openapi(healthRoute, c => {
  return c.json({
    status: 'healthy',
    message: 'Service is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime?.() || 0,
  })
})

// Slots route
const slotsRoute = createRoute({
  method: 'get',
  path: '/api/slots',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              total: z.number(),
              remaining: z.number(),
              filled: z.number(),
              percentage: z.number(),
            }),
            message: z.string(),
          }),
        },
      },
      description: 'Slots information',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            error: z.string().optional(),
          }),
        },
      },
      description: 'Server error',
    },
  },
})

app.openapi(slotsRoute, c => {
  return c.json({
    success: true,
    data: {
      total: 500,
      remaining: 250,
      filled: 250,
      percentage: 50,
    },
    message: 'Slots data retrieved successfully',
  })
})

// Signup route
const signupRoute = createRoute({
  method: 'post',
  path: '/api/signup',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email(),
            role: z.string().min(1),
            platform: z.string().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              userId: z.number(),
              remaining: z.number(),
              email: z.string(),
            }),
          }),
        },
      },
      description: 'Successful registration',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z
              .array(
                z.object({
                  field: z.string(),
                  message: z.string(),
                })
              )
              .optional(),
          }),
        },
      },
      description: 'Validation error',
    },
    409: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
      description: 'Email already registered',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            error: z.string().optional(),
          }),
        },
      },
      description: 'Server error',
    },
  },
})

app.openapi(signupRoute, c => {
  return c.json({
    success: true,
    message: 'Successfully registered!',
    data: {
      userId: 123,
      remaining: 249,
      email: 'user@example.com',
    },
  })
})

export default app
