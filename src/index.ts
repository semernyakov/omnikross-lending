import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import db from "./db.ts";

const app = new Hono();

// API: Get Slot Count
app.get("/api/slots", (c) => {
  const total = (
    db.prepare('SELECT value FROM config WHERE key = "total_slots"').get() as {
      value: string;
    }
  ).value;
  const remaining = (
    db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }
  ).count;
  const filled = parseInt(total) - remaining;

  return c.json({
    total: parseInt(total),
    remaining,
    filled,
    message: "Slots data retrieved successfully",
  });
});

// API: Handle Signup
app.post("/api/signup", async (c) => {
  try {
    const formData = await c.req.json();

    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(formData.email) as { id: number } | null;
    if (existing) {
      return c.json(
        { success: false, message: "Email already registered!" },
        400,
      );
    }
    if (existing) {
      return c.json(
        { success: false, message: "Email already registered!" },
        400,
      );
    }

    const total = (
      db
        .prepare('SELECT value FROM config WHERE key = "total_slots"')
        .get() as { value: string }
    ).value;
    const remaining = (
      db.prepare("SELECT COUNT(*) as count FROM users").get() as {
        count: number;
      }
    ).count;

    if (remaining <= 0) {
      return c.json({ success: false, message: "No slots available." }, 400);
    }

    const result = db
      .prepare("INSERT INTO users (email, role, platform) VALUES (?, ?, ?)")
      .run(formData.email, formData.role, formData.platform);
    db.prepare(
      'UPDATE config SET value = value - 1 WHERE key = "total_slots"',
    ).run();

    return c.json({
      success: true,
      message: "Successfully registered!",
      userId: result.lastInsertRowid,
      remaining: parseInt(total) - remaining - 1,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return c.json({ success: false, message: "Server error." }, 500);
  }
});

app.use("*", serveStatic({ root: "./public" }));
app.get("*", serveStatic({ path: "./public/index.html", root: "./" }));

console.log("Server is running on port 3000 with SQLite");
export default {
  port: 3000,
  fetch: app.fetch,
};
