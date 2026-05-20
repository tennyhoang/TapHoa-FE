import api from '@/lib/api';
import { Hub } from '@/store/hub.store';

export const hubService = {
  getActive: () =>
    api.get<Hub[]>('/hubs', { params: { isActive: true } }).then(r => r.data),
};
