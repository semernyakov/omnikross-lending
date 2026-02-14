import { Database } from "bun:sqlite";

const DB_PATH = "./data/omnikross.db";

// Initialize Database
const db = new Database(DB_PATH);

// Schema Setup
export const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      platform TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Check if total_slots config exists
  const row = db
    .prepare('SELECT value FROM config WHERE key = "total_slots"')
    .get();

  if (!row) {
    db.prepare(
      'INSERT INTO config (key, value) VALUES ("total_slots", "500")',
    ).run();
  }
};

// Initialize on import
initDb();

export default db;
