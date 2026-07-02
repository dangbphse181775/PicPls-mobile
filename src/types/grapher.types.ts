// ─── Grapher profile management types ─────────────────────────────────────────

import type { ServicePackageResponse } from './booking.types';

export interface PortfolioItemResponse {
  id: string;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
}

export interface GrapherProfileMeResponse {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  location: string;
  district: string | null;
  bio: string;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  isVerified: boolean;
  styles: string[];
  portfolio: PortfolioItemResponse[];
  servicePackages: ServicePackageResponse[];
  equipment: string | null;
  hourlyPrice: number;
  dailyPrice: number;
}

export interface ServicePackageUpsertRequest {
  id?: string | null;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export interface UpdateGrapherProfileRequest {
  bio: string;
  location: string;
  district?: string | null;
  styles: string[];
  portfolio: string[];
  equipment?: string | null;
  hourlyPrice?: number;
  dailyPrice?: number;
  servicePackages: ServicePackageUpsertRequest[];
}

// ─── Preset / Bootstrap types ────────────────────────────────────────────────

export interface PresetResponse {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  downloads: string;
  price: number;
}

export interface BootstrapResponse {
  photographers: any[];
  services: any[];
  styles: any[];
  presets: PresetResponse[];
  bookingStatuses: string[];
  bookings: any[];
  demoAccounts: any[];
  testimonials: any[];
  membershipPlans: any[];
  mockUsers: any[];
  mockDisputes: any[];
  mockActivities: any[];
  mockMessages: any[];
  favoritePhotographerIds: string[];
}
