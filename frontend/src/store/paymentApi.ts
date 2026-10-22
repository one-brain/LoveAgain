import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface WalletBalanceResponse {
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
}

export interface WalletTransactionDto {
  id: string;
  amount: number;
  direction: 'Credit' | 'Debit';
  type: string;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface CreateTopUpOrderRequest {
  amount: number;
  currency?: string;
}

export interface CreateTopUpOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  transactionId: string;
}

export interface VerifyTopUpRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
}

export interface WalletCheckoutRequest {
  orderId: string;
}

export interface WalletCheckoutResponse {
  orderId: string;
  escrowHoldId: string;
  grossAmount: number;
  platformFee: number;
  providerEarnings: number;
  status: string;
}

export interface ProviderEarningsResponse {
  grossRevenue: number;
  platformCommission: number;
  clearedBalance: number;
  pendingBalance: number;
  currency: string;
}

export interface RequestPayoutRequest {
  amount: number;
  payoutType: 'Upi' | 'BankTransfer';
  destination: string;
}

export interface PayoutResponse {
  payoutId: string;
  amount: number;
  feeAmount: number;
  status: string;
  destination: string;
  createdAt: string;
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1/payments`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Wallet', 'Transactions', 'Earnings', 'Payouts'],
  endpoints: (builder) => ({
    getWalletBalance: builder.query<WalletBalanceResponse, void>({
      query: () => `/wallet/balance`,
      providesTags: ['Wallet'],
    }),
    getWalletTransactions: builder.query<WalletTransactionDto[], number | void>({
      query: (limit = 20) => `/wallet/transactions?limit=${limit}`,
      providesTags: ['Transactions'],
    }),
    createTopUpOrder: builder.mutation<CreateTopUpOrderResponse, CreateTopUpOrderRequest>({
      query: (body) => ({
        url: `/wallet/topup/order`,
        method: 'POST',
        body,
      }),
    }),
    verifyTopUp: builder.mutation<WalletBalanceResponse, VerifyTopUpRequest>({
      query: (body) => ({
        url: `/wallet/topup/verify`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'Transactions'],
    }),
    checkoutWithWallet: builder.mutation<WalletCheckoutResponse, WalletCheckoutRequest>({
      query: (body) => ({
        url: `/checkout/wallet`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'Transactions', 'Earnings'],
    }),
    releaseEscrow: builder.mutation<{ status: string; netAmount: number; platformFee: number }, { orderId: string }>({
      query: (body) => ({
        url: `/escrow/release`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'Transactions', 'Earnings'],
    }),
    getProviderEarnings: builder.query<ProviderEarningsResponse, void>({
      query: () => `/provider/earnings`,
      providesTags: ['Earnings'],
    }),
    requestPayout: builder.mutation<PayoutResponse, RequestPayoutRequest>({
      query: (body) => ({
        url: `/payout/request`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'Transactions', 'Earnings', 'Payouts'],
    }),
    getPayoutHistory: builder.query<PayoutResponse[], void>({
      query: () => `/payout/history`,
      providesTags: ['Payouts'],
    }),
  }),
});

export const {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useCreateTopUpOrderMutation,
  useVerifyTopUpMutation,
  useCheckoutWithWalletMutation,
  useReleaseEscrowMutation,
  useGetProviderEarningsQuery,
  useRequestPayoutMutation,
  useGetPayoutHistoryQuery,
} = paymentApi;

