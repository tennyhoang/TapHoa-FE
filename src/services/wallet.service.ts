import api from '@/lib/api';

export type WalletTransactionType = 'Credit' | 'Debit';

export interface WalletTransactionDto {
  id: string;
  amount: number;
  type: WalletTransactionType;
  description: string;
  createdAt: string;
}

export interface WalletResponse {
  balance: number;
  recentTransactions: WalletTransactionDto[];
}

export interface PagedWalletTransactions {
  items: WalletTransactionDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InitiateTopupResult {
  paymentRef: string;
  amount: number;
}

export interface WithdrawRequestData {
  amount: number;
  bankName: string;
  accountNumber: string;
  holderName: string;
}

export const walletService = {
  getWallet: () =>
    api.get<WalletResponse>('/wallet/me').then(r => r.data),

  getTransactions: (page = 1, pageSize = 20) =>
    api.get<PagedWalletTransactions>('/wallet/me/transactions', { params: { page, pageSize } })
      .then(r => r.data),

  initiateTopup: (amount: number) =>
    api.post<InitiateTopupResult>('/wallet/me/topup/initiate', { amount }).then(r => r.data),

  createWithdrawRequest: (data: WithdrawRequestData) =>
    api.post<{ id: string }>('/wallet/me/withdraw-request', data).then(r => r.data),
};
