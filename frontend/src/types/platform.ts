// Core 3-Pillar Companionship Platform Types

export type PlatformLens = 'companions' | 'wellness' | 'pro_work';

export interface SkilledServiceOffering {
  id: string;
  title: string;
  category: string;
  description: string;
  rate: number;
  rateUnit: 'hour' | 'project';
  portfolioUrls?: string[];
}

export interface UniversalProfile {
  providerId: string;
  displayName: string;
  photoUrl: string | null;
  hourlyRate: number;
  bio: string;
  specialties: string[];
  averageRating: number;
  isVerified: boolean;
  trustScore: number;
  distanceKm: number | null;
  // 3-Pillar Capabilities
  activeLenses: PlatformLens[];
  servicesOffered?: SkilledServiceOffering[];
  activitiesOffered?: string[];
  languages?: string[];
  experienceYears?: number;
}

