import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import { authApi } from './authApi';
import { discoveryApi } from './discoveryApi';
import { bookingApi } from './bookingApi';
import { chatApi } from './chatApi';
import { profileApi } from './api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    [authApi.reducerPath]: authApi.reducer,
    [discoveryApi.reducerPath]: discoveryApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(authApi.middleware)
      .concat(discoveryApi.middleware)
      .concat(bookingApi.middleware)
      .concat(chatApi.middleware)
      .concat(profileApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;