import { Database } from 'bun:sqlite'
import { join } from 'path'

// Use absolute path for database
const DB_PATH = join(process.cwd(), 'data', 'omnikross.db')

// Initialize Database
const db = new Database(DB_PATH)

// Graceful shutdown handler
const setupGracefulShutdown = () => {
  const shutdown = () => {
    console.log('Closing database connection...')
    db.close()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
  process.on('SIGQUIT', shutdown)
}

// Schema Setup
export const initDb = () => {
  try {
    // Create tables with proper constraints
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        platform TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    db.exec(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Check if total_slots config exists
    const row = db.prepare('SELECT value FROM config WHERE key = "total_slots"').get()

    if (!row) {
      db.prepare('INSERT INTO config (key, value) VALUES ("total_slots", "500")').run()
      console.log('Initialized total_slots to 500')
    }

    // Ensure data directory exists
    const fs = require('fs')
    const dataDir = join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
      console.log('Created data directory:', dataDir)
    }

    console.log('Database initialized successfully at:', DB_PATH)
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

// Initialize on import
initDb()
setupGracefulShutdown()

export default db
