import api from '@/lib/api';
import { Claim, ClaimType, PagedResult } from '@/types';

export const claimService = {
  getMyClaims: (params: { page?: number; pageSize?: number } = {}): Promise<PagedResult<Claim>> =>
    api
      .get<PagedResult<Claim>>('/customer/claims', { params: { page: 1, pageSize: 20, ...params } })
      .then(r => r.data),

  create: (payload: { orderId: string; type: ClaimType; description: string }): Promise<Claim> =>
    api.post<Claim>('/claims', payload).then(r => r.data),
};
