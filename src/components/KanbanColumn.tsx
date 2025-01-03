import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AVV } from '../types/avv';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface KanbanColumnProps {
  id: string;
  title: string;
  items: AVV[];
}

export const KanbanColumn = ({ id, title, items }: KanbanColumnProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4"
    >
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((avv) => (
          <div
            key={avv.id}
            className="bg-white p-4 rounded shadow-sm"
          >
            <h4 className="font-medium">{avv.projectName}</h4>
            <p className="text-sm text-gray-600">{avv.clientName}</p>
            <div className="mt-2 text-sm">
              <p>Budget: {avv.budget.toLocaleString('fr-FR')} €</p>
              <p>Échéance: {format(new Date(avv.deadline), 'dd MMMM yyyy', { locale: fr })}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {avv.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};