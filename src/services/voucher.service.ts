import api from '@/lib/api';
import { VoucherResponse } from '@/types';

export const voucherService = {
  validate: (code: string): Promise<VoucherResponse> =>
    api.post<VoucherResponse>('/vouchers/validate', { code }).then(r => r.data),
};
