import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { PetHeader } from '../components/pet/PetHeader';
import { PetDetails } from '../components/pet/PetDetails';
import { PetMedicalHistory } from '../components/pet/PetMedicalHistory';
import { PetVaccinations } from '../components/pet/PetVaccinations';
import { PetSocial } from '../components/pet/social/PetSocial';
import { EditPetProfile } from '../components/pet/edit/EditPetProfile';
import { SharePetProfile } from '../components/pet/share/SharePetProfile';
import { petService } from '../lib/supabase/services';
import type { Pet, MedicalRecord, Vaccination } from '../types/pet';

export function PetProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const isOwner = user?.id === pet?.ownerId;

  useEffect(() => {
    const fetchPet = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const petData = await petService.getPet(id);
        setPet(petData);
        console.log("PetData is",petData)
      } catch (err) {
        console.error('Error fetching pet:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch pet'));
        toast.error('Failed to load pet details');
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleUpdatePet = async (updatedPet: Pet) => {
    if (!id) return;
    try {
      const saved = await petService.updatePet(id, updatedPet);
      setPet(saved);
      setIsEditing(false);
      toast.success('Pet profile updated successfully');
    } catch (err) {
      console.error('Error updating pet:', err);
      toast.error('Failed to update pet profile');
    }
  };

  const handleLike = async () => {
    if (!id || !user) {
      toast.error('You must be logged in to like a pet');
      return;
    }
    try {
      const updatedPet = await petService.likePet(
        id, 
        user.id, 
        user.user_metadata?.full_name || 'Anonymous'
      );
      setPet(updatedPet);
    } catch (err) {
      console.error('Error liking pet:', err);
      toast.error('Failed to like pet');
    }
  };

  const handleReview = async (rating: number, comment: string) => {
    if (!id || !user) {
      toast.error('You must be logged in to review a pet');
      return;
    }
    try {
      const updatedPet = await petService.reviewPet(
        id,
        user.id,
        user.user_metadata?.full_name || 'Anonymous',
        rating,
        comment
      );
      setPet(updatedPet);
      toast.success('Review added successfully');
    } catch (err) {
      console.error('Error reviewing pet:', err);
      toast.error('Failed to add review');
    }
  };

  const handleComment = async (content: string) => {
    if (!id || !user) {
      toast.error('You must be logged in to comment');
      return;
    }
    try {
      const updatedPet = await petService.postComment(
        id,
        user.id,
        user.user_metadata?.full_name || 'Anonymous',
        content
      );
      setPet(updatedPet);
      toast.success('Comment added successfully');
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error('Failed to add comment');
    }
  };

  const handleAddMedicalRecord = async (record: Omit<MedicalRecord, 'id'>) => {
    if (!id) return;
    try {
      const updatedPet = await petService.addMedicalRecord(id, record);
      setPet(updatedPet);
      toast.success('Medical record added successfully');
    } catch (err) {
      console.error('Error adding medical record:', err);
      toast.error('Failed to add medical record');
    }
  };

  const handleAddVaccination = async (vaccination: Omit<Vaccination, 'id'>) => {
    if (!id) return;
    try {
      const updatedPet = await petService.addVaccination(id, vaccination);
      setPet(updatedPet);
      toast.success('Vaccination record added successfully');
    } catch (err) {
      console.error('Error adding vaccination:', err);
      toast.error('Failed to add vaccination');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error?.message || 'Pet not found'}</p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PetHeader 
        pet={pet}
        isOwner={isOwner}
        onEdit={() => setIsEditing(true)}
        onShare={() => setIsSharing(true)}
      />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PetDetails pet={pet} />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <PetSocial 
            pet={pet} 
            onLike={handleLike}
            onReview={handleReview}
            onComment={handleComment}
          />
          <PetMedicalHistory 
            records={pet.medicalHistory}
            onAddRecord={handleAddMedicalRecord}
            isOwner={isOwner}
          />
          <PetVaccinations 
            vaccinations={pet.vaccinations}
            onAddVaccination={handleAddVaccination}
            isOwner={isOwner}
          />
        </div>
      </div>

      {isEditing && (
        <EditPetProfile
          pet={pet}
          onClose={() => setIsEditing(false)}
          onSave={handleUpdatePet}
        />
      )}

      {isSharing && (
        <SharePetProfile
          pet={pet}
          onClose={() => setIsSharing(false)}
        />
      )}
    </div>
  );
}