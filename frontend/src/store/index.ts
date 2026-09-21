import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import { authApi } from './authApi';
import { discoveryApi } from './discoveryApi';
import { bookingApi } from './bookingApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    [authApi.reducerPath]: authApi.reducer,
    [discoveryApi.reducerPath]: discoveryApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(authApi.middleware)
      .concat(discoveryApi.middleware)
      .concat(bookingApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;