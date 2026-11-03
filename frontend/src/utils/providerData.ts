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
    specialties: ['Tennis', 'Weekend Activities & Getaways', 'Special Events & Plus-One', 'Coffee Dates & Cafe Chats', 'Museum Walk'],
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
    services: ['Tennis Coaching (1-on-1)', 'Art Gallery Curator Walk', 'Coffee Date & Cafe Chats'],
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
    bio: 'Commercial photographer and street foodie guide. Available for photoshoots, food tours, and restaurant visits.',
    specialties: ['Photography', 'Restaurant Visits & Dining', 'Coffee Dates & Cafe Chats', 'City Tour'],
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
    services: ['Portrait Photoshoot Package', 'Street Food Crawl Host', 'Fine Dining Companion'],
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
    specialties: ['Hiking', 'Weekend Activities & Getaways', 'Movies & Cinema Outings', 'Violin', 'City Tour'],
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
    services: ['Violin Performance / Lesson', 'Weekend Ridge Trail Walk', 'Symphony & Cinema Companion'],
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
    bio: 'Certified salsa dance instructor & architectural history guide. Available for events, gala plus-one, and fine dining.',
    specialties: ['Dance', 'Special Events & Plus-One', 'Restaurant Visits & Dining', 'Event Host'],
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
    services: ['Salsa Coaching', 'Wedding Plus-One', 'Special Event Companion'],
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
    bio: 'Software Architect & avid book enthusiast. Available for coffee dates, weekend bookstore crawls, and indie movie screenings.',
    specialties: ['Coffee Dates & Cafe Chats', 'Movies & Cinema Outings', 'Weekend Activities & Getaways', 'Coding Mentorship'],
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
    services: ['System Design Mentorship', 'Artisanal Cafe Meet & Chat', 'Indie Cinema Discussion'],
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
    bio: 'Sommelier and fitness trainer. Host for restaurant visits, wine pairings, and weekend mountain hiking.',
    specialties: ['Restaurant Visits & Dining', 'Weekend Activities & Getaways', 'Gym Spotter', 'Tennis'],
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
    services: ['Curated Wine Tasting Session', 'Strength Training (1-on-1)', 'Weekend Hill Trek Companion'],
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
    specialties: ['Regional Homestyle Cook', 'Festival & Pooja Decor', 'Weekend Activities & Getaways'],
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
    specialties: ['Senior Companion & Temple Escort', 'Coffee Dates & Cafe Chats', 'Weekend Activities & Getaways'],
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
    bio: 'NIFT graduate & Mumbai heritage enthusiast. Available for boutique shopping, wardrobe styling, festive saree draping, and cafe meets.',
    specialties: ['Shopping & Styling Companion', 'Special Events & Plus-One', 'Coffee Dates & Cafe Chats'],
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
    services: ['Saree Draping & Festive Styling', 'Dadar Flower & Spice Mandi Tour', 'Boutique Styling Session'],
    introVideoUrl: null,
  },
  {
    providerId: 'sample-10',
    displayName: 'Meera Sen',
    gender: 'Female',
    photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1600,
    bio: 'Film critic & personal shopper in Connaught Place. Available for cinema outings, multiplex screenings, vintage market shopping, and cozy cafe discussions.',
    specialties: ['Movies & Cinema Outings', 'Shopping & Styling Companion', 'Coffee Dates & Cafe Chats'],
    averageRating: 4.96,
    isVerified: true,
    trustScore: 99,
    distanceKm: 2.2,
    maxRadiusKm: 25,
    latitude: 28.6315,
    longitude: 77.2167,
    city: 'Delhi-NCR',
    area: 'Connaught Place',
    lenses: ['companions', 'pro_work'],
    services: ['IMAX Cinema Date Companion', 'Janpath & Khan Market Shopping Walk', 'Post-Screening Coffee Debrief'],
    introVideoUrl: null,
  },
  {
    providerId: 'sample-11',
    displayName: 'Kabir Kapoor',
    gender: 'Male',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1750,
    bio: 'Culinary connoisseur & avid road tripper. Let us explore gourmet dining spots, attend weekend music festivals, or plan scenic day getaways.',
    specialties: ['Restaurant Visits & Dining', 'Weekend Activities & Getaways', 'Special Events & Plus-One'],
    averageRating: 4.95,
    isVerified: true,
    trustScore: 98,
    distanceKm: 3.4,
    maxRadiusKm: 30,
    latitude: 12.9352,
    longitude: 77.6245,
    city: 'Bengaluru',
    area: 'Koramangala',
    lenses: ['companions', 'wellness'],
    services: ['Chef Tasting Menu Companion', 'Weekend Nandi Hills Sunrise Drive', 'Concert & Gala Plus-One'],
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
    const target = providerId.toLowerCase();
    const found = liveProviders.find((p) => {
      const pid = (p.providerId || p.userId || p.id || '').toString().toLowerCase();
      return pid === target;
    });
    if (found) {
      return {
        providerId: found.providerId || found.userId || found.id,
        displayName: found.displayName || (found.firstName ? (found.firstName + ' ' + (found.lastName || '')).trim() : 'Verified Guest'),
        photoUrl: found.photoUrl || (found.profileImages && found.profileImages[0]) || (found.photoUrls && found.photoUrls[0]),
        profileImages: found.profileImages || found.photoUrls || [],
        hourlyRate: found.hourlyRate,
        averageRating: found.averageRating,
        isVerified: found.isVerified ?? true,
        trustScore: found.trustScore,
        specialty: found.specialties ? found.specialties[0] : (found.specialty || undefined),
        specialties: found.specialties || (found.specialty ? [found.specialty] : []),
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
    displayName: 'Verified Guest',
  };
}

