import api from '@/lib/api';
import { Address } from '@/types';

export const addressService = {
  getAll: () => api.get<Address[]>('/addresses').then(r => r.data),
  add: (data: Omit<Address, 'id'>) =>
    api.post<Address>('/addresses', data).then(r => r.data),
  setDefault: (id: string) =>
    api.patch<Address>(`/addresses/${id}/default`).then(r => r.data),
  remove: (id: string) => api.delete(`/addresses/${id}`),
};
