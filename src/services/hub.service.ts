import api from '@/lib/api';
import { Hub } from '@/store/hub.store';

export const hubService = {
  getActive: (params?: { lat?: number; lng?: number }) =>
    api.get<Hub[]>('/hubs', { params: { ...(params ?? {}) } }).then(r => r.data),
};
