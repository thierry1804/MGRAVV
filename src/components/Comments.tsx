import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send } from 'lucide-react';
import { useCommentStore } from '../store/commentStore';

interface CommentsProps {
  avvId: string;
}

export const Comments: React.FC<CommentsProps> = ({ avvId }) => {
  const { comments, addComment, fetchComments } = useCommentStore();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments(avvId);
  }, [avvId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment({
        avvId,
        content: newComment.trim()
      });
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <p className="text-gray-900">{comment.content}</p>
            <p className="text-sm text-gray-500 mt-2">
              {format(new Date(comment.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="sticky bottom-0 bg-white pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};