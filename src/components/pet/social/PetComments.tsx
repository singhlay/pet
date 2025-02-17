import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useDebounce } from '../../../hooks/useDebounce';
import type { Pet, Comment } from '../../../types/pet';

interface PetCommentsProps {
  pet: Pet;
  onComment: (content: string) => void;
}

export function PetComments({ pet, onComment }: PetCommentsProps) {
  const { user, isAuthenticated } = useAuth();
  const [comment, setComment] = useState('');
  const [optimisticComments, setOptimisticComments] = useState(pet.comments);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { execute: debouncedComment } = useDebounce(onComment, {
    delay: 500,
    onError: (error) => {
      setError(error.message);
      setOptimisticComments(pet.comments);
    }
  });

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user || !comment.trim() || submitting) return;

    const newComment: Comment = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: pet.ownerName || 'Anonymous',
      content: comment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0
    };

    setOptimisticComments(prev => [...prev, newComment]);
    setSubmitting(true);
    setError(null);

    try {
      await debouncedComment(comment.trim());
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-medium text-gray-900">Comments</h3>
        <span className="text-sm text-gray-500">({optimisticComments.length})</span>
      </div>

      {isAuthenticated && (
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            disabled={submitting}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!comment.trim() || submitting}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {optimisticComments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-gray-500" />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">{comment.userName}</h4>
                <span className="text-sm text-gray-500">
                  {new Date(comment.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}