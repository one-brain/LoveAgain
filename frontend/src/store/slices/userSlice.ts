import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  // We'll define the shape of user state later
  // For now, we can leave it empty or with a placeholder
  id: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  roles: ('Seeker' | 'Provider' | 'Admin')[] | null;
}

const initialState: UserState = {
  id: null,
  email: null,
  firstName: null,
  lastName: null,
  roles: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      Object.assign(state, action.payload);
    },
    clearUser: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;