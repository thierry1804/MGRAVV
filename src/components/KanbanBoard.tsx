import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useAVVStore } from '../store/avvStore';
import { AVVCard } from './AVVCard';
import { AVVStatus } from '../types/avv';
import { ClotureDialog } from './ClotureDialog';

const columns: { id: AVVStatus | 'cloture'; title: string; color: string; bgColor: string }[] = [
  { 
    id: 'reception', 
    title: 'Réception', 
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    id: 'analyse', 
    title: 'Analyse', 
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  { 
    id: 'proposition', 
    title: 'Proposition', 
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50'
  },
  { 
    id: 'validation', 
    title: 'Validation', 
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    id: 'cloture', 
    title: 'Clôture', 
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50'
  }
];

export const KanbanBoard: React.FC = () => {
  const { avvs, updateAVVStatus } = useAVVStore();
  const [isDragging, setIsDragging] = useState(false);
  const [showClotureDialog, setShowClotureDialog] = useState(false);
  const [pendingAVV, setPendingAVV] = useState<{ id: string; projectName: string } | null>(null);

  const onDragEnd = async (result: DropResult) => {
    setIsDragging(true);
    const { destination, source, draggableId } = result;

    if (!destination) {
      setIsDragging(false);
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      setIsDragging(false);
      return;
    }

    if (destination.droppableId === 'cloture') {
      const avv = avvs.find(a => a.id === draggableId);
      if (avv) {
        setPendingAVV({ id: avv.id, projectName: avv.projectName });
        setShowClotureDialog(true);
      }
      setIsDragging(false);
      return;
    }

    try {
      await updateAVVStatus(draggableId, destination.droppableId as AVVStatus);
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
    } finally {
      setIsDragging(false);
    }
  };

  const handleCloture = async (status: 'cloture_gagne' | 'cloture_perdu') => {
    if (pendingAVV) {
      try {
        await updateAVVStatus(pendingAVV.id, status);
      } catch (error) {
        console.error('Erreur lors de la clôture:', error);
      }
      setShowClotureDialog(false);
      setPendingAVV(null);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-5 gap-1">
          {columns.map((column) => (
            <div 
              key={column.id} 
              className={`flex flex-col ${column.bgColor} rounded-xl border border-gray-200/80`}
            >
              <div className={`rounded-t-xl bg-gradient-to-r ${column.color} p-4 shadow-sm sticky top-[4.5rem] z-10`}>
                <h3 className="font-semibold text-white text-lg">
                  {column.title}
                  <span className="ml-2 text-sm opacity-90">
                    ({column.id === 'cloture' 
                      ? avvs.filter(avv => avv.status === 'cloture_gagne' || avv.status === 'cloture_perdu').length
                      : avvs.filter(avv => avv.status === column.id).length})
                  </span>
                </h3>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-4 space-y-4
                      ${snapshot.isDraggingOver ? 'bg-opacity-75' : ''} 
                      transition-colors duration-200
                      ${isDragging ? 'pointer-events-none' : ''}`}
                  >
                    {avvs
                      .filter((avv) => {
                        if (column.id === 'cloture') {
                          return avv.status === 'cloture_gagne' || avv.status === 'cloture_perdu';
                        }
                        return avv.status === column.id;
                      })
                      .map((avv, index) => (
                        <Draggable
                          key={avv.id}
                          draggableId={avv.id}
                          index={index}
                          isDragDisabled={isDragging}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transform transition-transform duration-200
                                ${snapshot.isDragging ? 'rotate-2 scale-105' : ''}`}
                            >
                              <AVVCard avv={avv} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {pendingAVV && (
        <ClotureDialog
          isOpen={showClotureDialog}
          onClose={() => {
            setShowClotureDialog(false);
            setPendingAVV(null);
          }}
          onSelect={handleCloture}
          projectName={pendingAVV.projectName}
        />
      )}
    </>
  );
};