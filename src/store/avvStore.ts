import { create } from 'zustand';
import { AVV, AVVStatus } from '../types/avv';
import { getDB, saveDB } from '../db/schema';
import { useNotificationStore } from './notificationStore';
import { useHistoryStore } from './historyStore';

interface AVVStore {
  avvs: AVV[];
  loading: boolean;
  error: string | null;
  addAVV: (avv: Omit<AVV, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAVV: (id: string, data: Partial<Omit<AVV, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  updateAVVStatus: (id: string, status: AVVStatus) => Promise<void>;
  deleteAVV: (id: string) => Promise<void>;
  fetchAVVs: () => Promise<void>;
}

type ModifiableAVVFields = keyof Omit<AVV, 'id' | 'createdAt' | 'updatedAt'>;

function isModifiableAVVKey(key: string): key is ModifiableAVVFields {
  return ['clientName', 'projectName', 'budget', 'deadline', 'needs', 'technologies', 'status'].includes(key);
}

export const useAVVStore = create<AVVStore>((set, get) => ({
  avvs: [],
  loading: false,
  error: null,

  addAVV: async (avvData) => {
    try {
      set({ loading: true, error: null });
      const db = await getDB();
      const now = new Date().toISOString();
      const newAVV: AVV = {
        id: crypto.randomUUID(),
        ...avvData,
        createdAt: now,
        updatedAt: now,
      };

      // Validation des données
      if (!newAVV.clientName || !newAVV.projectName || newAVV.budget < 0) {
        throw new Error('Données invalides');
      }

      // Utiliser une transaction pour garantir l'intégrité des données
      db.run('BEGIN TRANSACTION');
      
      try {
        db.run(`
          INSERT INTO avvs (id, clientName, projectName, budget, deadline, needs, technologies, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          newAVV.id,
          newAVV.clientName,
          newAVV.projectName,
          newAVV.budget,
          newAVV.deadline,
          newAVV.needs,
          JSON.stringify(newAVV.technologies),
          newAVV.status,
          newAVV.createdAt,
          newAVV.updatedAt
        ]);

        db.run('COMMIT');
        saveDB(); // Sauvegarder après la transaction

        // Mettre à jour le state après la sauvegarde réussie
        set((state) => ({ 
          avvs: [...state.avvs, newAVV],
          loading: false 
        }));

        // Notification de succès
        useNotificationStore.getState().addNotification({
          title: 'AVV créé',
          message: `L'avant-projet "${newAVV.projectName}" a été créé avec succès.`,
          type: 'info'
        });
      } catch (error) {
        db.run('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error('Erreur lors de la création de l\'AVV:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création',
        loading: false 
      });
      
      useNotificationStore.getState().addNotification({
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la création de l\'AVV.',
        type: 'error'
      });
    }
  },

  updateAVV: async (id: string, data: Partial<Omit<AVV, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      set({ loading: true, error: null });
      const db = await getDB();
      const now = new Date().toISOString();
      const currentAVV = get().avvs.find(a => a.id === id);

      if (!currentAVV) {
        throw new Error('AVV non trouvé');
      }

      // Préparer les données mises à jour
      const updatedData = {
        ...currentAVV,
        ...data,
        technologies: Array.isArray(data.technologies) 
          ? data.technologies 
          : currentAVV.technologies,
        updatedAt: now
      };

      db.run('BEGIN TRANSACTION');

      try {
        // Pour chaque champ modifié, créer une entrée dans l'historique seulement si la valeur a changé
        for (const field of Object.keys(data)) {
          if (isModifiableAVVKey(field)) {
            const oldValue = field === 'technologies' 
              ? currentAVV[field].join(',')
              : String(currentAVV[field]);
            
            const newValue = field === 'technologies'
              ? updatedData[field].join(',')
              : String(data[field]);

            // Ne créer une entrée que si les valeurs sont réellement différentes
            if (oldValue !== newValue) {
              const historyId = crypto.randomUUID();
              db.run(`
                INSERT INTO avv_history (id, avvId, field, oldValue, newValue, createdAt)
                VALUES (?, ?, ?, ?, ?, ?)
              `, [historyId, id, field, oldValue, newValue, now]);
            }
          }
        }

        // Mettre à jour l'AVV
        db.run(`
          UPDATE avvs 
          SET clientName = ?,
              projectName = ?,
              budget = ?,
              deadline = ?,
              needs = ?,
              technologies = ?,
              updatedAt = ?
          WHERE id = ?
        `, [
          updatedData.clientName,
          updatedData.projectName,
          updatedData.budget,
          updatedData.deadline,
          updatedData.needs,
          JSON.stringify(updatedData.technologies),
          updatedData.updatedAt,
          id
        ]);

        db.run('COMMIT');
        saveDB();

        // Mettre à jour les states après la transaction
        useHistoryStore.getState().fetchHistoryForAVV(id);

        set((state) => ({
          avvs: state.avvs.map((avv) =>
            avv.id === id ? updatedData : avv
          ),
          loading: false
        }));

        useNotificationStore.getState().addNotification({
          title: 'AVV mis à jour',
          message: `L'avant-projet "${updatedData.projectName}" a été mis à jour avec succès.`,
          type: 'info'
        });
      } catch (error) {
        db.run('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'AVV:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
        loading: false 
      });

      useNotificationStore.getState().addNotification({
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la mise à jour de l\'AVV.',
        type: 'error'
      });
    }
  },

  updateAVVStatus: async (id, status) => {
    const db = await getDB();
    try {
      set({ loading: true, error: null });
      const now = new Date().toISOString();
      const currentAVV = get().avvs.find(a => a.id === id);

      if (!currentAVV) {
        throw new Error('AVV non trouvé');
      }

      // Exécuter toutes les opérations dans une seule transaction
      db.run('BEGIN TRANSACTION');

      // Insérer l'entrée d'historique directement avec SQL plutôt que d'utiliser le store
      const historyId = crypto.randomUUID();
      db.run(`
        INSERT INTO avv_history (id, avvId, field, oldValue, newValue, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [historyId, id, 'status', currentAVV.status, status, now]);

      // Mettre à jour le statut
      db.run(`
        UPDATE avvs 
        SET status = ?, updatedAt = ? 
        WHERE id = ?
      `, [status, now, id]);

      // Commit la transaction
      db.run('COMMIT');
      saveDB();

      // Mettre à jour les states après la transaction
      useHistoryStore.getState().fetchHistoryForAVV(id);
      
      set((state) => ({
        avvs: state.avvs.map((avv) =>
          avv.id === id ? { ...avv, status, updatedAt: now } : avv
        ),
        loading: false
      }));

      useNotificationStore.getState().addNotification({
        title: 'Statut mis à jour',
        message: `Le statut de l'AVV a été mis à jour vers "${status}".`,
        type: 'info'
      });
    } catch (error) {
      try {
        db.run('ROLLBACK');
      } catch (rollbackError) {
        console.error('Erreur lors du rollback:', rollbackError);
      }

      console.error('Erreur lors de la mise à jour du statut:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
        loading: false 
      });
    }
  },

  deleteAVV: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const db = await getDB();
      const avv = get().avvs.find(a => a.id === id);
      
      if (!avv) {
        throw new Error('AVV non trouvé');
      }

      db.run('BEGIN TRANSACTION');
      
      try {
        // Supprimer d'abord les commentaires associés
        db.run('DELETE FROM comments WHERE avvId = ?', [id]);
        
        // Puis supprimer l'AVV
        db.run('DELETE FROM avvs WHERE id = ?', [id]);

        db.run('COMMIT');
        saveDB(); // Sauvegarder après la transaction

        set((state) => ({
          avvs: state.avvs.filter((a) => a.id !== id),
          loading: false
        }));

        useNotificationStore.getState().addNotification({
          title: 'AVV supprimé',
          message: `L'avant-projet "${avv.projectName}" a été supprimé avec succès.`,
          type: 'info'
        });
      } catch (error) {
        db.run('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error('Erreur lors de la suppression de l\'AVV:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
        loading: false 
      });

      useNotificationStore.getState().addNotification({
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la suppression de l\'AVV.',
        type: 'error'
      });
    }
  },

  fetchAVVs: async () => {
    try {
      set({ loading: true, error: null });
      const db = await getDB();
      
      const result = db.exec(`
        SELECT * FROM avvs 
        ORDER BY createdAt DESC
      `);

      if (result[0]) {
        const avvs = result[0].values.map((row) => ({
          id: row[0] as string,
          clientName: row[1] as string,
          projectName: row[2] as string,
          budget: row[3] as number,
          deadline: row[4] as string,
          needs: row[5] as string,
          technologies: JSON.parse(row[6] as string),
          status: row[7] as AVVStatus,
          createdAt: row[8] as string,
          updatedAt: row[9] as string,
        }));

        set({ avvs, loading: false });
      } else {
        // Si aucun résultat, initialiser avec un tableau vide
        set({ avvs: [], loading: false });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des AVVs:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement',
        loading: false 
      });

      useNotificationStore.getState().addNotification({
        title: 'Erreur de chargement',
        message: 'Impossible de charger les AVVs. Veuillez rafraîchir la page.',
        type: 'error'
      });
    }
  },
}));