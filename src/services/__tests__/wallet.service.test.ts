import { describe, it, expect, vi, beforeEach } from 'vitest';
import { walletService } from '../wallet.service';

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from '@/lib/api';
const mockApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('walletService', () => {
  it('getWallet returns wallet response', async () => {
    const wallet = { balance: 1000, recentTransactions: [] };
    mockApi.get.mockResolvedValue({ data: wallet });
    const result = await walletService.getWallet();
    expect(mockApi.get).toHaveBeenCalledWith('/wallet/me');
    expect(result).toEqual(wallet);
  });

  it('getTransactions uses default paging', async () => {
    const paged = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };
    mockApi.get.mockResolvedValue({ data: paged });
    const result = await walletService.getTransactions();
    expect(mockApi.get).toHaveBeenCalledWith('/wallet/me/transactions', {
      params: { page: 1, pageSize: 20 },
    });
    expect(result).toEqual(paged);
  });

  it('getTransactions uses custom params', async () => {
    const paged = { items: [], totalCount: 5, page: 2, pageSize: 10, totalPages: 1 };
    mockApi.get.mockResolvedValue({ data: paged });
    const result = await walletService.getTransactions(2, 10);
    expect(mockApi.get).toHaveBeenCalledWith('/wallet/me/transactions', {
      params: { page: 2, pageSize: 10 },
    });
    expect(result).toEqual(paged);
  });

  it('initiateTopup returns paymentRef and amount', async () => {
    const topup = { paymentRef: 'ref-1', amount: 50000 };
    mockApi.post.mockResolvedValue({ data: topup });
    const result = await walletService.initiateTopup(50000);
    expect(mockApi.post).toHaveBeenCalledWith('/wallet/me/topup/initiate', { amount: 50000 });
    expect(result).toEqual(topup);
  });

  it('createWithdrawRequest returns { id }', async () => {
    const data = { amount: 20000, bankName: 'Bank', accountNumber: '123', holderName: 'Name' };
    mockApi.post.mockResolvedValue({ data: { id: 'wr-1' } });
    const result = await walletService.createWithdrawRequest(data);
    expect(mockApi.post).toHaveBeenCalledWith('/wallet/me/withdraw-request', data);
    expect(result).toEqual({ id: 'wr-1' });
  });
});
