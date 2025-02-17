import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useDebounce } from '../../../hooks/useDebounce';
import type { Pet } from '../../../types/pet';

interface PetLikesProps {
  pet: Pet;
  onLike: () => void;
}

export function PetLikes({ pet, onLike }: PetLikesProps) {
  const { user, isAuthenticated } = useAuth();
  const [optimisticLikes, setOptimisticLikes] = useState(pet.likes);
  const [error, setError] = useState<string | null>(null);

  const { execute: debouncedLike } = useDebounce(onLike, {
    delay: 500,
    onError: (error) => {
      setError(error.message);
      setOptimisticLikes(pet.likes);
    }
  });

  const hasLiked = user && optimisticLikes.some(like => like.userId === user.id);

  const handleLike = async () => {
    if (!isAuthenticated || !user) return;

    // Optimistically update UI
    const newLike = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: pet.ownerName || 'Anonymous',
      timestamp: new Date().toISOString()
    };

    setOptimisticLikes(prev => hasLiked 
      ? prev.filter(like => like.userId !== user.id)
      : [...prev, newLike]
    );

    setError(null);
    await debouncedLike();
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleLike}
        disabled={!isAuthenticated}
        className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
          hasLiked 
            ? 'text-rose-600 bg-rose-50' 
            : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
        } transition-colors`}
      >
        <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{optimisticLikes.length}</span>
      </button>
      {optimisticLikes.length > 0 && (
        <span className="text-sm text-gray-500">
          Liked by {optimisticLikes[0].userName}
          {optimisticLikes.length > 1 && ` and ${optimisticLikes.length - 1} others`}
        </span>
      )}
      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}