import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

const app = new Hono();

// Serve static files from public directory
app.use('*', serveStatic({ root: './public' }));

// API endpoint for getting slot information
app.get('/api/slots', (c) => {
  // Simulate API response with random slot data
  const remaining = Math.floor(Math.random() * 6) + 3; // Random between 3-8
  const filled = 25 - remaining;

  return c.json({
    remaining,
    filled,
    total: 25,
    message: 'Slots data retrieved successfully'
  });
});

// API endpoint for signup
app.post('/api/signup', async (c) => {
  const formData = await c.req.json();

  // Simulate processing the signup
  const slotNumber = Math.floor(Math.random() * 25) + 1;
  const remaining = Math.floor(Math.random() * 5) + 1;

  return c.json({
    success: true,
    message: 'Successfully registered!',
    slotNumber,
    remaining,
    formData // Echo back the form data for debugging
  });
});

// Fallback to serve index.html for client-side routing
app.get('*', serveStatic({ path: './public/index.html', root: './' }));

console.log('Server is running on port 3000');
export default {
  port: 3000,
  fetch: app.fetch,
};
