import { Database } from 'bun:sqlite';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'omnikross.db'));

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

export const initDb = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS registration (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      lang TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telegram TEXT,
      phone TEXT,
      company TEXT,
      clients_count INTEGER,
      confirm_token TEXT NOT NULL UNIQUE,
      is_confirmed INTEGER NOT NULL DEFAULT 0,
      confirmed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const hasLegacy = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='registrations'").get();
  if (hasLegacy) {
    db.run(`
      INSERT OR IGNORE INTO registration (role, lang, email, telegram, phone, company, clients_count, confirm_token, is_confirmed, confirmed_at, created_at)
      SELECT role, lang, email, telegram, NULL as phone, company, clients_count, confirm_token, is_confirmed, confirmed_at, created_at
      FROM registrations
    `);
    db.run('DROP TABLE registrations');
  }

  const columns = db.prepare("PRAGMA table_info(registration)").all() as Array<{ name: string }>;
  const hasPhone = columns.some((column) => column.name === 'phone');
  if (!hasPhone) db.run('ALTER TABLE registration ADD COLUMN phone TEXT');

  db.run('DROP TABLE IF EXISTS users');
  db.run('DROP TABLE IF EXISTS config');

  console.log('📦 SQLite Database initialized (single table: registration).');
};

export default db;
