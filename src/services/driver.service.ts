import api from '@/lib/api';

export interface RouteStop {
  stopNumber: number;
  originalIndex: number;
  address: string;
  lng: number | null;
  lat: number | null;
}

export interface OptimizeRouteResponse {
  stops: RouteStop[];
  isOptimized: boolean;
  hubLng: number | null;
  hubLat: number | null;
}

export const driverService = {
  optimizeRoute: (hubAddress: string, orderAddresses: string[]) =>
    api.post<OptimizeRouteResponse>('/driver/optimize-route', {
      hubAddress,
      orderAddresses,
    }).then(r => r.data),
};
