import { create } from 'zustand';
import { Attachment } from '../types/attachment';
import { getDB, saveDB } from '../db/schema';

interface AttachmentStore {
  attachments: Attachment[];
  loading: boolean;
  addAttachment: (avvId: string, file: File) => Promise<void>;
  deleteAttachment: (id: string) => Promise<void>;
  fetchAttachments: (avvId: string) => Promise<void>;
}

export const useAttachmentStore = create<AttachmentStore>((set, get) => ({
  attachments: [],
  loading: false,

  addAttachment: async (avvId: string, file: File) => {
    const db = await getDB();
    const now = new Date().toISOString();

    // Convertir le fichier en base64
    const buffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const newAttachment: Attachment = {
      id: crypto.randomUUID(),
      avvId,
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64,
      createdAt: now,
      updatedAt: now,
    };

    db.run('BEGIN TRANSACTION');

    try {
      db.run(`
        INSERT INTO attachments (id, avvId, name, type, size, data, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        newAttachment.id,
        newAttachment.avvId,
        newAttachment.name,
        newAttachment.type,
        newAttachment.size,
        newAttachment.data,
        newAttachment.createdAt,
        newAttachment.updatedAt
      ]);

      // Ajouter une entrée dans l'historique
      const historyId = crypto.randomUUID();
      db.run(`
        INSERT INTO avv_history (id, avvId, field, oldValue, newValue, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        historyId,
        avvId,
        'attachment',
        '',
        `Ajout du fichier: ${file.name}`,
        now
      ]);

      db.run('COMMIT');
      saveDB();

      set((state) => ({
        attachments: [...state.attachments, newAttachment]
      }));
    } catch (error) {
      db.run('ROLLBACK');
      throw error;
    }
  },

  deleteAttachment: async (id: string) => {
    const db = await getDB();
    const attachment = get().attachments.find(a => a.id === id);
    if (!attachment) return;

    const now = new Date().toISOString();

    db.run('BEGIN TRANSACTION');

    try {
      db.run('DELETE FROM attachments WHERE id = ?', [id]);

      // Ajouter une entrée dans l'historique
      const historyId = crypto.randomUUID();
      db.run(`
        INSERT INTO avv_history (id, avvId, field, oldValue, newValue, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        historyId,
        attachment.avvId,
        'attachment',
        `Suppression du fichier: ${attachment.name}`,
        '',
        now
      ]);

      db.run('COMMIT');
      saveDB();

      set((state) => ({
        attachments: state.attachments.filter(a => a.id !== id)
      }));
    } catch (error) {
      db.run('ROLLBACK');
      throw error;
    }
  },

  fetchAttachments: async (avvId: string) => {
    const db = await getDB();
    set({ loading: true });

    try {
      const results = db.exec(`
        SELECT * FROM attachments 
        WHERE avvId = ? 
        ORDER BY createdAt DESC
      `, [avvId]);

      const attachments = results[0]?.values.map((row) => ({
        id: String(row[0]),
        avvId: String(row[1]),
        name: String(row[2]),
        type: String(row[3]),
        size: Number(row[4]),
        data: String(row[5]),
        createdAt: String(row[6]),
        updatedAt: String(row[7])
      })) || [];

      set({ attachments, loading: false });
    } catch (error) {
      console.error('Erreur lors du chargement des pièces jointes:', error);
      set({ attachments: [], loading: false });
    }
  },
})); 