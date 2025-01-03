import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Paperclip, X, Download, Upload } from 'lucide-react';
import { useAttachmentStore } from '../store/attachmentStore';
import { Attachment } from '../types/attachment';

interface AttachmentsProps {
  avvId: string;
}

export const Attachments: React.FC<AttachmentsProps> = ({ avvId }) => {
  const { attachments, addAttachment, deleteAttachment, fetchAttachments } = useAttachmentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAttachments(avvId);
  }, [avvId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await addAttachment(avvId, file);
      } catch (error) {
        console.error('Erreur lors de l\'ajout du fichier:', error);
      }
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = `data:${attachment.type};base64,${attachment.data}`;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="bg-gray-50 p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Paperclip className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)} • 
                  {format(new Date(attachment.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(attachment)}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 
                  transition-all duration-200"
                title="Télécharger"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={() => deleteAttachment(attachment.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 
                  transition-all duration-200"
                title="Supprimer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 text-white rounded-lg
          hover:bg-indigo-700 transition-colors duration-200"
      >
        <Upload className="h-5 w-5" />
        Ajouter un fichier
      </button>
    </div>
  );
}; 