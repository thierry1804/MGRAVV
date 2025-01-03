import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, DollarSign, Building2, Trash2, Edit, History, MessageSquare, Paperclip, Trophy } from 'lucide-react';
import { useAVVStore } from '../store/avvStore';
import { ConfirmDialog } from './ConfirmDialog';
import { Offcanvas } from './Offcanvas';
import { EditAVVForm } from './EditAVVForm';
import { AVV } from '../types/avv';
import { AVVHistory } from './AVVHistory';
import { Comments } from './Comments';
import { Attachments } from './Attachments';

interface AVVCardProps {
  avv: AVV;
}

export const AVVCard: React.FC<AVVCardProps> = ({ avv }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const { deleteAVV } = useAVVStore();

  // Vérifier si l'AVV peut être supprimé
  const canDelete = !['validation', 'cloture_gagne', 'cloture_perdu'].includes(avv.status);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAVV(avv.id);
    } finally {
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <div className={`bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border 
        relative group overflow-hidden
        ${avv.status === 'cloture_gagne' 
          ? 'border-green-200 bg-gradient-to-br from-white to-green-50' 
          : 'border-gray-100'}`}
      >
        {avv.status === 'cloture_gagne' && (
          <div className="absolute right-0 bottom-0 transform translate-x-1/4 translate-y-1/4 opacity-5">
            <Trophy className="w-48 h-48 text-green-600" />
          </div>
        )}

        <div className="absolute top-4 right-4 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
          <button
            onClick={() => setShowEditForm(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 
              transition-all duration-200"
            title="Modifier l'AVV"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 
              transition-all duration-200"
            title="Voir l'historique"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowComments(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 
              transition-all duration-200"
            title="Commentaires"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowAttachments(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 
              transition-all duration-200"
            title="Pièces jointes"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isDeleting || !canDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
            title={canDelete 
              ? "Supprimer l'AVV" 
              : "Impossible de supprimer un AVV en validation ou clôturé"}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-start justify-between pr-24">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-lg text-gray-900">{avv.projectName}</h4>
              {avv.status === 'cloture_gagne' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Trophy className="w-3 h-3 mr-1" />
                  Gagné
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="w-4 h-4 text-gray-400" />
              <p className="text-gray-600">{avv.clientName}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-600">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(avv.budget)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-600">
              {format(new Date(avv.deadline), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-1.5">
          {avv.technologies.map((tech, index) => (
            <span
              key={index}
              className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full
                hover:bg-indigo-100 transition-colors duration-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog && canDelete}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer l'avant-projet"
        message={`Êtes-vous sûr de vouloir supprimer l'avant-projet "${avv.projectName}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        type="danger"
        isLoading={isDeleting}
      />

      {showEditForm && (
        <Offcanvas
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          title={`Modifier l'avant-projet "${avv.projectName}"`}
        >
          <EditAVVForm 
            avv={avv} 
            onSuccess={() => setShowEditForm(false)} 
          />
        </Offcanvas>
      )}

      {showHistory && (
        <Offcanvas
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          title="Historique des modifications"
        >
          <AVVHistory avvId={avv.id} />
        </Offcanvas>
      )}

      {showComments && (
        <Offcanvas
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          title={`Commentaires - ${avv.projectName}`}
        >
          <Comments avvId={avv.id} />
        </Offcanvas>
      )}

      {showAttachments && (
        <Offcanvas
          isOpen={showAttachments}
          onClose={() => setShowAttachments(false)}
          title={`Pièces jointes - ${avv.projectName}`}
        >
          <Attachments avvId={avv.id} />
        </Offcanvas>
      )}
    </>
  );
}; 