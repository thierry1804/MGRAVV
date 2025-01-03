import React from 'react';
import { createPortal } from 'react-dom';
import { Trophy, XCircle } from 'lucide-react';

interface ClotureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (status: 'cloture_gagne' | 'cloture_perdu') => void;
  projectName: string;
}

export const ClotureDialog: React.FC<ClotureDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
  projectName,
}) => {
  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Clôturer l'avant-projet "{projectName}"
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onSelect('cloture_gagne')}
                className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200"
              >
                <Trophy className="h-12 w-12 text-green-500" />
                <span className="font-medium text-green-700">Gagné</span>
              </button>
              <button
                onClick={() => onSelect('cloture_perdu')}
                className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-red-200 hover:border-red-500 hover:bg-red-50 transition-all duration-200"
              >
                <XCircle className="h-12 w-12 text-red-500" />
                <span className="font-medium text-red-700">Perdu</span>
              </button>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}; 