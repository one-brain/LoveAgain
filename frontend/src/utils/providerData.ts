import type { PlatformLens } from '../types/platform';

export interface CuratedProvider {
  providerId: string;
  displayName: string;
  photoUrl: string;
  profileImages: string[];
  hourlyRate: number;
  bio: string;
  specialties: string[];
  averageRating: number;
  isVerified: boolean;
  trustScore: number;
  distanceKm?: number;
  maxRadiusKm?: number;
  latitude?: number;
  longitude?: number;
  city?: string;
  area?: string;
  lenses?: PlatformLens[];
  services?: string[];
  introVideoUrl?: string | null;
  gender?: 'Female' | 'Male' | 'Non-Binary' | string;
}

export const SAMPLE_PROVIDERS_LIST: CuratedProvider[] = [
  {
    providerId: 'sample-1',
    displayName: 'Elena Rostova',
    gender: 'Female',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1500,
    bio: 'Semi-pro tennis coach, contemporary art curator, and bilingual city companion.',
    specialties: ['Tennis', 'Yoga Partner', 'Museum Walk', 'Gym Spotter'],
    averageRating: 4.98,
    isVerified: true,
    trustScore: 99,
    distanceKm: 2.4,
    maxRadiusKm: 25,
    latitude: 12.9784,
    longitude: 77.6408,
    city: 'Bengaluru',
    area: 'Indiranagar',
    lenses: ['wellness', 'companions'],
    services: ['Tennis Coaching (1-on-1)', 'Art Gallery Curator Walk'],
    introVideoUrl: 'https://youtube.com',
  },
  {
    providerId: 'sample-2',
    displayName: 'Marcus Vance',
    gender: 'Male',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1800,
    bio: 'Commercial photographer and street foodie guide. Available for photoshoots and culinary outings.',
    specialties: ['Photography', 'Cooking & Baking', 'City Tour'],
    averageRating: 4.95,
    isVerified: true,
    trustScore: 98,
    distanceKm: 3.8,
    maxRadiusKm: 30,
    latitude: 19.0596,
    longitude: 72.8295,
    city: 'Mumbai',
    area: 'Bandra West',
    lenses: ['pro_work', 'companions'],
    services: ['Portrait Photoshoot Package', 'Street Food Crawl Host'],
    introVideoUrl: null,
  },
  {
    providerId: 'sample-3',
    displayName: 'Dr. Sophia Chen',
    gender: 'Female',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1200,
    bio: 'Cardiologist & classical violinist. Let us explore mountain trails, scenic viewpoints, or catch a live symphony.',
    specialties: ['Hiking', 'Yoga Partner', 'Violin', 'City Tour'],
    averageRating: 4.92,
    isVerified: true,
    trustScore: 97,
    distanceKm: 1.9,
    maxRadiusKm: 20,
    latitude: 28.5494,
    longitude: 77.2001,
    city: 'Delhi-NCR',
    area: 'South Delhi (Hauz Khas)',
    lenses: ['wellness', 'companions'],
    services: ['Violin Performance / Lesson'],
    introVideoUrl: null,
  },
  {
    providerId: 'sample-4',
    displayName: 'Julian Alvarez',
    gender: 'Male',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1600,
    bio: 'Certified salsa dance instructor & architectural history guide. Available for events & plus-one.',
    specialties: ['Dance', 'Plus-One', 'Event Host', 'Architecture'],
    averageRating: 4.88,
    isVerified: true,
    trustScore: 96,
    distanceKm: 4.5,
    maxRadiusKm: 35,
    latitude: 17.4435,
    longitude: 78.3772,
    city: 'Hyderabad',
    area: 'Hitec City',
    lenses: ['pro_work', 'companions'],
    services: ['Salsa Coaching', 'Wedding Plus-One'],
    introVideoUrl: null,
  },
  {
    providerId: 'sample-5',
    displayName: 'Aria Thorne',
    gender: 'Female',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1500,
    bio: 'Software Architect & avid book enthusiast. Available for coffee chats, tech career mentoring, and museum visits.',
    specialties: ['Coding Mentorship', 'Language Practice', 'Museum Walk', 'Cafe & Chat'],
    averageRating: 4.97,
    isVerified: true,
    trustScore: 99,
    distanceKm: 2.1,
    maxRadiusKm: 25,
    latitude: 12.9352,
    longitude: 77.6245,
    city: 'Bengaluru',
    area: 'Koramangala',
    lenses: ['pro_work', 'companions'],
    services: ['System Design Mentorship'],
    introVideoUrl: null,
  },
  {
    providerId: 'sample-6',
    displayName: 'David Morales',
    gender: 'Male',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 2000,
    bio: 'Sommelier and fitness trainer. Host for dining excursions and high-intensity workout coaching.',
    specialties: ['Fine Dining', 'Gym Spotter', 'Tennis'],
    averageRating: 4.94,
    isVerified: true,
    trustScore: 98,
    distanceKm: 5.2,
    maxRadiusKm: 30,
    latitude: 18.5362,
    longitude: 73.8940,
    city: 'Pune',
    area: 'Koregaon Park',
    lenses: ['wellness', 'companions'],
    services: ['Curated Wine Tasting Session', 'Strength Training (1-on-1)'],
    introVideoUrl: null,
  },
  {
    providerId: 'sample-7',
    displayName: 'Ananya Sharma',
    gender: 'Female',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1200,
    bio: 'Passionate regional home chef and urban botanist. Specializing in healthy regional homestyle meal prep, festive flower rangolis, and lush balcony herb gardens.',
    specialties: ['Regional Homestyle Cook', 'Festival & Pooja Decor', 'Balcony Tulsi & Gardening'],
    averageRating: 4.96,
    isVerified: true,
    trustScore: 99,
    distanceKm: 3.1,
    maxRadiusKm: 25,
    latitude: 12.9784,
    longitude: 77.6408,
    city: 'Bengaluru',
    area: 'Indiranagar',
    lenses: ['lifestyle', 'companions'],
    services: ['Weekly Homestyle Dabba Meal Prep', 'Festive Flower Rangoli & Pooja Setup'],
    introVideoUrl: null,
  },
  {
    providerId: 'sample-8',
    displayName: 'Col. Rajeshwar Rao (Retd.)',
    gender: 'Male',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1000,
    bio: 'Retired defense officer & avid reader. Passionate about providing dignified, warm companionship to senior citizens for temple visits, evening walks, carrom, and engaging conversations.',
    specialties: ['Senior Companion & Temple Escort', 'Carrom & Society Sports', 'Evening Chai & Gupshup'],
    averageRating: 4.99,
    isVerified: true,
    trustScore: 100,
    distanceKm: 2.8,
    maxRadiusKm: 30,
    latitude: 17.4319,
    longitude: 78.4073,
    city: 'Hyderabad',
    area: 'Jubilee Hills',
    lenses: ['lifestyle', 'wellness'],
    services: ['Senior Temple Darshan & Walk Escort', 'Carrom & Board Game Afternoon'],
    introVideoUrl: null,
  },
  {
    providerId: 'sample-9',
    displayName: 'Pooja Iyer',
    gender: 'Female',
    photoUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1400,
    bio: 'NIFT graduate & Mumbai heritage enthusiast. Available for traditional saree draping, wedding boutique shopping in Dadar/Linking Road, and desi pantry organizing.',
    specialties: ['Ethnic Styling & Saree Draping', 'Sabzi Mandi & Bazaar Guide', 'Pantry & Dabba Organization'],
    averageRating: 4.93,
    isVerified: true,
    trustScore: 97,
    distanceKm: 4.1,
    maxRadiusKm: 35,
    latitude: 19.0178,
    longitude: 72.8478,
    city: 'Mumbai',
    area: 'Dadar West',
    lenses: ['lifestyle', 'pro_work'],
    services: ['Saree Draping & Festive Styling', 'Dadar Flower & Spice Mandi Tour'],
    introVideoUrl: null,
  },
];

/**
 * Converts a curated sample ID (e.g. "sample-1") into a deterministic UUID
 * so it can be persisted in PostgreSQL `bookings.service_orders` and `payments.escrow_holds`.
 */
export function toProviderGuid(providerId: string): string {
  const trimmed = (providerId || '').trim();
  if (trimmed === 'sample-1' || trimmed === 'p1') return '158b9ff7-19de-49ce-a57c-b37738591285';
  if (trimmed === 'sample-2' || trimmed === 'p2') return '6d187ed5-aff0-4fa3-856c-9beb89264b15';
  if (trimmed === 'sample-3' || trimmed === 'p3') return '010e1920-fdf6-4419-85c1-95d284c6730d';
  const match = /^(?:sample-|p)(\d+)$/i.exec(trimmed);
  if (match) {
    const num = parseInt(match[1], 10);
    const hex = num.toString(16).padStart(12, '0');
    return `00000000-0000-0000-0000-${hex}`;
  }
  return trimmed;
}

export const SAMPLE_PROVIDERS_MAP: Record<string, CuratedProvider> = SAMPLE_PROVIDERS_LIST.reduce(
  (acc, provider) => {
    acc[provider.providerId] = provider;
    acc[toProviderGuid(provider.providerId)] = provider;
    return acc;
  },
  {} as Record<string, CuratedProvider>
);

export function generateDemoSlots() {
  const slots = [];
  const now = new Date();
  for (let i = 1; i <= 4; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);

    // Morning slot
    const startM = new Date(d);
    startM.setHours(10, 0, 0, 0);
    const endM = new Date(d);
    endM.setHours(12, 0, 0, 0);
    slots.push({
      slotId: `slot-${i}-m`,
      startTime: startM.toISOString(),
      endTime: endM.toISOString(),
      isBooked: false,
    });

    // Afternoon slot
    const startA = new Date(d);
    startA.setHours(14, 30, 0, 0);
    const endA = new Date(d);
    endA.setHours(16, 30, 0, 0);
    slots.push({
      slotId: `slot-${i}-a`,
      startTime: startA.toISOString(),
      endTime: endA.toISOString(),
      isBooked: false,
    });
  }
  return slots;
}

export interface ResolvedProviderInfo {
  providerId: string;
  displayName: string;
  photoUrl?: string;
  profileImages?: string[];
  hourlyRate?: number;
  averageRating?: number;
  isVerified?: boolean;
  trustScore?: number;
  specialty?: string;
  specialties?: string[];
  bio?: string;
  maxRadiusKm?: number;
  distanceKm?: number;
  latitude?: number;
  longitude?: number;
  city?: string;
  area?: string;
  services?: string[];
}

/**
 * Resolves a companion's full display info (photo, name, rating, verified badge, bio)
 * against curated sample providers or live backend providers.
 */
export function resolveProviderInfo(
  providerId?: string,
  liveProviders?: any[]
): ResolvedProviderInfo {
  if (!providerId) {
    return {
      providerId: '',
      displayName: 'Companion Outing',
    };
  }

  // Check curated sample provider map
  const sample = SAMPLE_PROVIDERS_MAP[providerId];
  if (sample) {
    return {
      providerId: sample.providerId,
      displayName: sample.displayName,
      photoUrl: sample.photoUrl,
      profileImages: sample.profileImages,
      hourlyRate: sample.hourlyRate,
      averageRating: sample.averageRating,
      isVerified: sample.isVerified,
      trustScore: sample.trustScore,
      specialty: sample.specialties[0],
      specialties: sample.specialties,
      bio: sample.bio,
      maxRadiusKm: sample.maxRadiusKm,
      distanceKm: sample.distanceKm,
      latitude: sample.latitude,
      longitude: sample.longitude,
      city: sample.city,
      area: sample.area,
      services: sample.services,
    };
  }

  // Check live backend providers list if available
  if (liveProviders && liveProviders.length > 0) {
    const found = liveProviders.find(
      (p) => p.providerId === providerId || p.userId === providerId
    );
    if (found) {
      return {
        providerId: found.providerId || found.userId,
        displayName: found.displayName || 'Verified Companion',
        photoUrl: found.photoUrl || (found.profileImages && found.profileImages[0]),
        profileImages: found.profileImages,
        hourlyRate: found.hourlyRate,
        averageRating: found.averageRating,
        isVerified: found.isVerified ?? true,
        trustScore: found.trustScore,
        specialty: found.specialties ? found.specialties[0] : undefined,
        specialties: found.specialties,
        bio: found.bio,
        maxRadiusKm: found.maxRadiusKm,
        distanceKm: found.distanceKm,
        latitude: found.latitude,
        longitude: found.longitude,
        services: found.services,
      };
    }
  }

  // Fallback for unknown provider IDs
  return {
    providerId,
    displayName: 'Verified Companion',
  };
}

