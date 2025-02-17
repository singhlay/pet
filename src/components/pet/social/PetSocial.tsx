import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { PetLikes } from './PetLikes';
import { PetReviews } from './PetReviews';
import { PetComments } from './PetComments';
import type { Pet } from '../../../types/pet';

interface PetSocialProps {
  pet: Pet;
  onLike: () => void;
  onReview: (rating: number, comment: string) => void;
  onComment: (content: string) => void;
}

export function PetSocial({ pet, onLike, onReview, onComment }: PetSocialProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          <button className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Social
          </button>
        </nav>
      </div>

      <div className="p-6 space-y-8">
        <PetLikes pet={pet} onLike={onLike} />
        <PetReviews pet={pet} onReview={onReview} />
        <PetComments pet={pet} onComment={onComment} />

        {!isAuthenticated && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Please sign in to like, review, or comment on this profile
            </p>
          </div>
        )}
      </div>
    </div>
  );
}