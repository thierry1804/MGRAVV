import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { History } from 'lucide-react';
import { useHistoryStore } from '../store/historyStore';

interface AVVHistoryProps {
  avvId: string;
}

const fieldLabels: Record<string, string> = {
  clientName: 'Client',
  projectName: 'Projet',
  budget: 'Budget',
  deadline: 'Échéance',
  needs: 'Besoins',
  technologies: 'Technologies',
  status: 'Statut'
};

export const AVVHistory: React.FC<AVVHistoryProps> = ({ avvId }) => {
  const { history, loading, fetchHistoryForAVV } = useHistoryStore();

  useEffect(() => {
    fetchHistoryForAVV(avvId);
  }, [avvId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 text-indigo-600">
          <History />
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune modification enregistrée
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((entry) => (
        <div key={entry.id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900">
                Modification du {fieldLabels[entry.field] || entry.field}
              </h4>
              <div className="mt-1 text-sm">
                <p className="text-gray-600">
                  De : <span className="text-gray-900">{entry.oldValue}</span>
                </p>
                <p className="text-gray-600">
                  À : <span className="text-gray-900">{entry.newValue}</span>
                </p>
              </div>
            </div>
            <time className="text-sm text-gray-500">
              {format(new Date(entry.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </time>
          </div>
        </div>
      ))}
    </div>
  );
}; 