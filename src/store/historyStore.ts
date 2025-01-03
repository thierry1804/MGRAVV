import { create } from 'zustand';
import { AVVHistory } from '../types/history';
import { getDB, saveDB } from '../db/schema';

interface HistoryStore {
  history: AVVHistory[];
  loading: boolean;
  addHistoryEntry: (entry: Omit<AVVHistory, 'id' | 'createdAt'>) => Promise<void>;
  fetchHistoryForAVV: (avvId: string) => Promise<void>;
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  history: [],
  loading: false,

  addHistoryEntry: async (entry) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const newEntry: AVVHistory = {
      id: crypto.randomUUID(),
      ...entry,
      createdAt: now,
    };

    db.run(`
      INSERT INTO avv_history (id, avvId, field, oldValue, newValue, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      newEntry.id,
      newEntry.avvId,
      newEntry.field,
      newEntry.oldValue,
      newEntry.newValue,
      newEntry.createdAt
    ]);

    saveDB();
    set((state) => ({
      history: [...state.history, newEntry]
    }));
  },

  fetchHistoryForAVV: async (avvId: string) => {
    const db = await getDB();
    set({ loading: true });
    
    const results = db.exec(`
      SELECT * FROM avv_history 
      WHERE avvId = ? 
      ORDER BY createdAt DESC
    `, [avvId]);
    
    const history = results[0]?.values.map((row) => ({
      id: String(row[0]),
      avvId: String(row[1]),
      field: String(row[2]),
      oldValue: String(row[3]),
      newValue: String(row[4]),
      createdAt: String(row[5])
    })) || [];
    
    set({ history, loading: false });
  },
})); 