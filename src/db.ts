import { Database } from 'bun:sqlite';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

// Создаем папку для БД если её нет
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) mkdirSync(dataDir);

const db = new Database(join(dataDir, 'omnikross.db'));

/**
 * Инициализация схемы базы данных
 */
export const initDb = () => {
  // Таблица лидов
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица конфига для хранения счетчика слотов
  db.run(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Устанавливаем начальное кол-во слотов, если их нет
  const row = db.prepare('SELECT value FROM config WHERE key = "remaining_slots"').get();
  if (!row) {
    db.run('INSERT INTO config (key, value) VALUES ("remaining_slots", "500")');
  }
  
  console.log('📦 SQLite Database initialized.');
};

export default db;