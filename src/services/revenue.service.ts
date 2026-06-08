import api from '@/lib/api';

export type TimeRange = 'Week' | 'Month' | 'Year' | 'CustomRange';

export interface RevenueChartPoint {
  date: string;
  actualRevenue: number;
  projectedRevenue: number;
}

export interface TopProductItem {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface RevenueStats {
  actualRevenue: number;
  projectedRevenue: number;
  cancelledRevenue: number;
  totalOrders: number;
  successfulOrders: number;
  growthRate: number | null;
  chartData: RevenueChartPoint[];
  topProducts: TopProductItem[];
}

export const revenueService = {
  getStats: (timeRange: TimeRange = 'Month', from?: string, to?: string) =>
    api
      .get<RevenueStats>('/admin/revenue/stats', { params: { timeRange, from, to } })
      .then(r => r.data),
};
