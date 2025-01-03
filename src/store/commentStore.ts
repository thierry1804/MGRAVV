import { create } from 'zustand';
import { Comment } from '../types/comment';
import { getDB, saveDB } from '../db/schema';

interface CommentStore {
  comments: Comment[];
  loading: boolean;
  addComment: (comment: Pick<Comment, 'avvId' | 'content'>) => Promise<void>;
  fetchComments: (avvId: string) => Promise<void>;
}

export const useCommentStore = create<CommentStore>((set) => ({
  comments: [],
  loading: false,

  addComment: async (commentData) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const newComment: Comment = {
      id: crypto.randomUUID(),
      ...commentData,
      createdAt: now,
      updatedAt: now,
    };

    db.run('BEGIN TRANSACTION');

    try {
      // Insérer le commentaire
      db.run(`
        INSERT INTO comments (id, avvId, content, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
      `, [
        newComment.id,
        newComment.avvId,
        newComment.content,
        newComment.createdAt,
        newComment.updatedAt
      ]);

      // Ajouter une entrée dans l'historique
      const historyId = crypto.randomUUID();
      db.run(`
        INSERT INTO avv_history (id, avvId, field, oldValue, newValue, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        historyId,
        newComment.avvId,
        'comment',
        '',
        newComment.content,
        now
      ]);

      db.run('COMMIT');
      saveDB();

      set((state) => ({
        comments: [newComment, ...state.comments]
      }));
    } catch (error) {
      db.run('ROLLBACK');
      throw error;
    }
  },

  fetchComments: async (avvId: string) => {
    const db = await getDB();
    set({ loading: true });
    
    try {
      const results = db.exec(`
        SELECT * FROM comments 
        WHERE avvId = ? 
        ORDER BY createdAt DESC
      `, [avvId]);

      const comments = results[0]?.values.map((row) => ({
        id: String(row[0]),
        avvId: String(row[1]),
        content: String(row[2]),
        createdAt: String(row[3]),
        updatedAt: String(row[4])
      })) || [];

      set({ comments, loading: false });
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
      set({ comments: [], loading: false });
    }
  },
}));