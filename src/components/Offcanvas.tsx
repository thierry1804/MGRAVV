import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface OffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Offcanvas: React.FC<OffcanvasProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <>
      {/* Overlay avec animation */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 
          transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panneau latéral avec animation */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offcanvas-title"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 
            id="offcanvas-title" 
            className="text-xl font-semibold text-gray-900"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100
              transition-all duration-200"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenu avec défilement */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-73px)]">
          {children}
        </div>
      </div>
    </>
  );

  // Utiliser un portail pour rendre l'Offcanvas à la racine du document
  return createPortal(content, document.body);
}; 