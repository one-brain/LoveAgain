import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface BookingSummary {
  orderId: string;
  providerId: string;
  seekerId: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
}

export interface ProviderProfileState {
  userId: string | null;
  specialties: string[];
  isLoading: boolean;
  error: string | null;
  bookings: BookingSummary[];
  profileLoaded: boolean;
}

const initialState: ProviderProfileState = {
  userId: null,
  specialties: [],
  isLoading: false,
  error: null,
  bookings: [],
  profileLoaded: false,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setUserId(state, action: PayloadAction<string | null>) {
      state.userId = action.payload;
    },
    setSpecialties(state, action: PayloadAction<string[]>) {
      state.specialties = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setBookings(state, action: PayloadAction<BookingSummary[]>) {
      state.bookings = action.payload;
    },
    resetProfile(state) {
      state.userId = null;
      state.specialties = [];
      state.bookings = [];
      state.profileLoaded = false;
    },
  },
});

export const {
  setUserId,
  setSpecialties,
  setError,
  clearError,
  setBookings,
  resetProfile,
} = profileSlice.actions;

export default profileSlice.reducer;