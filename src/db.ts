import { Database } from 'bun:sqlite';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'omnikross.db'));

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

const getInitialSlots = () => {
  const parsed = Number.parseInt(process.env.MAX_SIGNUPS ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 500;
};

export const initDb = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  const row = db.prepare('SELECT value FROM config WHERE key = ?').get('remaining_slots');
  if (!row) {
    db.prepare('INSERT INTO config (key, value) VALUES (?, ?)').run('remaining_slots', String(getInitialSlots()));
  }

  console.log('📦 SQLite Database initialized.');
};

export default db;
