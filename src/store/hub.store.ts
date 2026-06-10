import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Hub {
  id: string;
  name: string;
  address: string;
  ward?: string;
  district?: string;
  province?: string;
  phoneNumber?: string;
  isActive: boolean;
  minimumOrderAmount?: number;
  freeShippingThreshold?: number;
  shippingFee?: number;
}

interface HubState {
  currentHub: Hub | null;
  setHub: (hub: Hub) => void;
  clearHub: () => void;
}

export const useHubStore = create<HubState>()(
  persist(
    set => ({
      currentHub: null,
      setHub: hub => set({ currentHub: hub }),
      clearHub: () => set({ currentHub: null }),
    }),
    { name: 'hub-storage' }
  )
);
