import { Database } from 'sql.js';
import { initSQL } from './initSqlJs';

let db: Database | null = null;

export async function initDB() {
  if (db) return db;
  
  const SQL = await initSQL();
  
  // Charger les données depuis localStorage si elles existent
  const savedData = localStorage.getItem('avv_db');
  if (savedData) {
    const uint8Array = new Uint8Array(savedData.split(',').map(Number));
    db = new (SQL as any).Database(uint8Array);
  } else {
    db = new (SQL as any).Database();
  }
  
  if (db) {
    db.run(`
      CREATE TABLE IF NOT EXISTS avvs (
        id TEXT PRIMARY KEY,
        clientName TEXT NOT NULL,
        projectName TEXT NOT NULL,
        budget REAL NOT NULL,
        deadline TEXT NOT NULL,
        needs TEXT NOT NULL,
        technologies TEXT NOT NULL,
        status TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        avvId TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (avvId) REFERENCES avvs(id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS avv_history (
        id TEXT PRIMARY KEY,
        avvId TEXT NOT NULL,
        field TEXT NOT NULL,
        oldValue TEXT NOT NULL,
        newValue TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (avvId) REFERENCES avvs(id)
      );

      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        avvId TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER NOT NULL,
        data TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (avvId) REFERENCES avvs(id)
      );
    `);
  }
  
  return db;
}

export async function getDB(): Promise<Database> {
  if (!db) {
    db = await initDB();
  }
  if (!db) {
    throw new Error('Failed to initialize database');
  }
  return db;
}

export function saveDB() {
  if (!db) return;
  
  // Sauvegarder la base de données dans localStorage
  const data = db.export();
  const array = Array.from(data);
  localStorage.setItem('avv_db', array.toString());
}