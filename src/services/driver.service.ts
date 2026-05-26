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

export interface AssignedWarehouseDto {
  id: string;
  name: string;
  fullAddress: string;
  phoneNumber: string | null;
}

export const driverService = {
  getMyWarehouse: (): Promise<AssignedWarehouseDto> =>
    api.get<AssignedWarehouseDto>('/driver/me/warehouse').then(r => r.data),

  optimizeRoute: (orderAddresses: string[]): Promise<OptimizeRouteResponse> =>
    api.post<OptimizeRouteResponse>('/driver/optimize-route', { orderAddresses }).then(r => r.data),
};
