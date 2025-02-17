import React from 'react';
import { User } from '@supabase/supabase-js';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };

  const getInitial = () => {
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || '?';
  };

  if (user.user_metadata?.avatar_url) {
    return (
      <img
        src={user.user_metadata.avatar_url}
        alt={user.user_metadata?.full_name || 'User avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium`}>
      {getInitial()}
    </div>
  );
}