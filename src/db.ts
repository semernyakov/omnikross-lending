// ════════════════════════════════════════════════════════════
// OmniKross Landing — Database Layer
// SQLite with prepared statements (injection-safe)
// ════════════════════════════════════════════════════════════

import { Database } from "bun:sqlite";

const DB_PATH = process.env.DB_PATH || "data/omnikross.db";

// Singleton instance
let db: Database;

export function getDB(): Database {
  if (!db) {
    db = new Database(DB_PATH, { create: true });
    
    // Enable WAL mode for better concurrency
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA synchronous = NORMAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      social TEXT,
      slot_number INTEGER NOT NULL,
      lang TEXT NOT NULL CHECK(lang IN ('ru', 'en')),
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Index for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_signups_email ON signups(email);
    CREATE INDEX IF NOT EXISTS idx_signups_created_at ON signups(created_at);
  `);
  
  console.log("✅ Database initialized:", DB_PATH);
}

// ─── Prepared Statements (для производительности) ───

export const queries = {
  // Получить текущее количество регистраций
  getSignupCount: () => {
    const stmt = db.prepare("SELECT COUNT(*) as total FROM signups");
    return (stmt.get() as { total: number }).total;
  },
  
  // Создать новую регистрацию
  createSignup: (email: string, social: string | null, lang: string, ip: string, ua: string) => {
    // Используем транзакцию для атомарности и избежания race condition
    const transaction = db.transaction(() => {
      // Получаем следующий slot_number атомарно
      const slotNumber = db.prepare("SELECT COALESCE(MAX(slot_number), 0) + 1 as next_slot FROM signups").get() as { next_slot: number };
      
      const stmt = db.prepare(`
        INSERT INTO signups (email, social, slot_number, lang, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(email, social, slotNumber.next_slot, lang, ip, ua);
      return slotNumber.next_slot;
    });
    
    try {
      const slotNumber = transaction();
      return { success: true, slotNumber };
    } catch (err: any) {
      if (err.message.includes("UNIQUE")) {
        return { success: false, error: "Email already registered" };
      }
      throw err;
    }
  },
  
  // Проверить, существует ли email
  emailExists: (email: string): boolean => {
    const stmt = db.prepare("SELECT 1 FROM signups WHERE email = ? LIMIT 1");
    return stmt.get(email) !== null;
  },
  
  // Получить последние регистрации (для админки)
  getRecentSignups: (limit: number = 10) => {
    const stmt = db.prepare(`
      SELECT id, email, social, slot_number, lang, created_at 
      FROM signups 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(limit);
  },
};

// ─── Экспорт для использования в других модулях ───
export { db };

// ─── Инициализация при импорте ───
getDB();
