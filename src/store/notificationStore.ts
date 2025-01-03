import { create } from 'zustand';
import { getDB, saveDB } from '../db/schema';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  fetchNotifications: async () => {
    const db = await getDB();
    const results = db.exec(`
      SELECT * FROM notifications 
      WHERE read = FALSE
      ORDER BY createdAt DESC
    `);

    const notifications = results[0]?.values.map((row) => ({
      id: String(row[0]),
      title: String(row[1]),
      message: String(row[2]),
      type: String(row[3]) as 'success' | 'error' | 'info' | 'warning',
      read: Boolean(row[4]),
      createdAt: String(row[5])
    })) || [];

    set({ notifications });
  },

  addNotification: async (notification) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      ...notification,
      read: false,
      createdAt: now,
    };

    db.run(`
      INSERT INTO notifications (id, title, message, type, read, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      newNotification.id,
      newNotification.title,
      newNotification.message,
      newNotification.type,
      0,
      newNotification.createdAt
    ]);
    saveDB();

    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));
  },

  markAsRead: async (id: string) => {
    const db = await getDB();
    db.run(`
      UPDATE notifications 
      SET read = 1
      WHERE id = ?
    `, [id]);
    saveDB();

    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }));
  },

  removeNotification: async (id: string) => {
    const db = await getDB();
    db.run('DELETE FROM notifications WHERE id = ?', [id]);
    saveDB();

    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }));
  },
}));