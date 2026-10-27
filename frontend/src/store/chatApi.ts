import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithReauth } from './baseQueryWithReauth';



export interface ChatMessageDto {
  id: string;
  orderId: string;
  senderId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  messageType: 'Text' | 'Image' | 'Video' | 'File';
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: createBaseQueryWithReauth('/api/v1/chat'),
  tagTypes: ['ChatMessages'],
  endpoints: (builder) => ({
    getOrderMessages: builder.query<ChatMessageDto[], { orderId: string; limit?: number; offset?: number }>({
      query: ({ orderId, limit = 50, offset = 0 }) => ({
        url: `/orders/${orderId}/messages`,
        params: { limit, offset },
      }),
      providesTags: (_result, _error, { orderId }) => [{ type: 'ChatMessages', id: orderId }],
    }),
    getUnreadCount: builder.query<number, string>({
      query: (orderId) => `/orders/${orderId}/unread-count`,
    }),
    markMessagesAsRead: builder.mutation<void, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/mark-read`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, orderId) => [{ type: 'ChatMessages', id: orderId }],
    }),
  }),
});

export const {
  useGetOrderMessagesQuery,
  useGetUnreadCountQuery,
  useMarkMessagesAsReadMutation,
} = chatApi;
