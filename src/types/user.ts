export interface UserPersonalInfo {
  fullName: string;
  email: string;
  avatarUrl: string;
  address: {
    postcode: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  bio?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  joinedDate: string;
  pets: string[];
  following: number;
  followers: number;
  reviews: number;
  rating: number;
  verified: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  matchingAlerts: boolean;
  privateProfile: boolean;
  language: string;
  timezone: string;
}

export interface UserStats {
  totalPets: number;
  totalMatches: number;
  successfulBreedings: number;
  reviewsGiven: number;
  reviewsReceived: number;
  averageRating: number;
}

export interface AuthUser extends User, UserPersonalInfo {
  avatar_url: string;
}
