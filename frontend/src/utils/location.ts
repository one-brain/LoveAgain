export interface MetroHub {
  id: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
}

export const INDIAN_METRO_HUBS: MetroHub[] = [
  // Bengaluru
  { id: 'blr-indiranagar', city: 'Bengaluru', area: 'Indiranagar', latitude: 12.9784, longitude: 77.6408 },
  { id: 'blr-koramangala', city: 'Bengaluru', area: 'Koramangala', latitude: 12.9352, longitude: 77.6245 },
  { id: 'blr-mgroad', city: 'Bengaluru', area: 'Central (MG Road)', latitude: 12.9716, longitude: 77.5946 },
  { id: 'blr-hsr', city: 'Bengaluru', area: 'HSR Layout', latitude: 12.9121, longitude: 77.6446 },
  { id: 'blr-whitefield', city: 'Bengaluru', area: 'Whitefield', latitude: 12.9698, longitude: 77.7500 },

  // Mumbai
  { id: 'mum-bandra', city: 'Mumbai', area: 'Bandra West', latitude: 19.0596, longitude: 72.8295 },
  { id: 'mum-bkc', city: 'Mumbai', area: 'BKC', latitude: 19.0662, longitude: 72.8682 },
  { id: 'mum-colaba', city: 'Mumbai', area: 'South Mumbai (Colaba)', latitude: 18.9220, longitude: 72.8347 },
  { id: 'mum-andheri', city: 'Mumbai', area: 'Andheri West', latitude: 19.1136, longitude: 72.8697 },
  { id: 'mum-juhu', city: 'Mumbai', area: 'Juhu', latitude: 19.1075, longitude: 72.8263 },

  // Delhi-NCR
  { id: 'del-cp', city: 'Delhi-NCR', area: 'Connaught Place', latitude: 28.6315, longitude: 77.2167 },
  { id: 'del-gurgaon', city: 'Delhi-NCR', area: 'Cyber City, Gurgaon', latitude: 28.4950, longitude: 77.0895 },
  { id: 'del-south', city: 'Delhi-NCR', area: 'South Delhi (Hauz Khas)', latitude: 28.5494, longitude: 77.2001 },
  { id: 'del-noida', city: 'Delhi-NCR', area: 'Sector 18, Noida', latitude: 28.5708, longitude: 77.3261 },

  // Hyderabad
  { id: 'hyd-hitec', city: 'Hyderabad', area: 'Hitec City', latitude: 17.4435, longitude: 78.3772 },
  { id: 'hyd-jubilee', city: 'Hyderabad', area: 'Jubilee Hills', latitude: 17.4325, longitude: 78.4071 },
  { id: 'hyd-gachibowli', city: 'Hyderabad', area: 'Gachibowli', latitude: 17.4401, longitude: 78.3489 },
  { id: 'hyd-banjara', city: 'Hyderabad', area: 'Banjara Hills', latitude: 17.4156, longitude: 78.4347 },

  // Pune
  { id: 'pun-kp', city: 'Pune', area: 'Koregaon Park', latitude: 18.5362, longitude: 73.8940 },
  { id: 'pun-kalyani', city: 'Pune', area: 'Kalyani Nagar', latitude: 18.5484, longitude: 73.9038 },
  { id: 'pun-baner', city: 'Pune', area: 'Baner', latitude: 18.5590, longitude: 73.7868 },

  // Chennai
  { id: 'chn-nungambakkam', city: 'Chennai', area: 'Nungambakkam', latitude: 13.0569, longitude: 80.2425 },
  { id: 'chn-adyar', city: 'Chennai', area: 'Adyar', latitude: 13.0012, longitude: 80.2565 },

  // Kolkata
  { id: 'kol-parkstreet', city: 'Kolkata', area: 'Park Street', latitude: 22.5510, longitude: 88.3524 },
  { id: 'kol-saltlake', city: 'Kolkata', area: 'Salt Lake', latitude: 22.5867, longitude: 88.4178 },
];

export const PRIMARY_CITIES = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi-NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'];

/**
 * Computes the great-circle Haversine distance in kilometers between two lat/lon pairs.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

/**
 * Resolves the nearest metro hub from coordinates.
 */
export function resolveNearestHub(
  latitude: number,
  longitude: number
): { city: string; area: string; hubName: string; distanceKm: number } {
  let closestHub = INDIAN_METRO_HUBS[0];
  let minDistance = Infinity;

  for (const hub of INDIAN_METRO_HUBS) {
    const dist = calculateHaversineDistance(latitude, longitude, hub.latitude, hub.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closestHub = hub;
    }
  }

  return {
    city: closestHub.city,
    area: closestHub.area,
    hubName: `${closestHub.area}, ${closestHub.city}`,
    distanceKm: minDistance,
  };
}

/**
 * Returns user's device coordinates via browser Geolocation API.
 */
export function getCurrentCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please select a city hub or allow location access.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
