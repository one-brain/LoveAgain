// Core 3-Lens Life Platform Types

export type PlatformLens = 'pro_work' | 'companions' | 'relationships';

export type RelationshipIntent = 'matrimony' | 'live_in' | 'dating' | 'casual';

export interface SkilledServiceOffering {
  id: string;
  title: string;
  category: string;
  description: string;
  rate: number;
  rateUnit: 'hour' | 'project';
  portfolioUrls?: string[];
}

export interface MatrimonyBiodata {
  education: string;
  profession: string;
  annualIncome?: string;
  motherTongue: string;
  height: string;
  diet: string;
  familyBackground?: string;
  partnerPreferences?: string;
  horoscopeRashi?: string;
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
  // 3-Lens Capabilities
  activeLenses: PlatformLens[];
  servicesOffered?: SkilledServiceOffering[];
  activitiesOffered?: string[];
  languages?: string[];
  relationshipIntents?: RelationshipIntent[];
  matrimonyBiodata?: MatrimonyBiodata;
  experienceYears?: number;
}

