import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import { authApi } from './authApi';
import { discoveryApi } from './discoveryApi';
import { bookingApi } from './bookingApi';
import { chatApi } from './chatApi';
import { profileApi } from './api';
import { paymentApi } from './paymentApi';
import { adminApi } from './adminApi';
import { reviewApi } from './reviewApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    [authApi.reducerPath]: authApi.reducer,
    [discoveryApi.reducerPath]: discoveryApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(authApi.middleware)
      .concat(discoveryApi.middleware)
      .concat(bookingApi.middleware)
      .concat(chatApi.middleware)
      .concat(profileApi.middleware)
      .concat(paymentApi.middleware)
      .concat(adminApi.middleware)
      .concat(reviewApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
