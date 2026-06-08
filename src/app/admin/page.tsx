'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Package,
  Tag,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart2,
} from 'lucide-react';
import { revenueService, type TimeRange } from '@/services/revenue.service';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { formatPrice } from '@/lib/format';

// ─── Time range selector ───────────────────────────────────────────────────

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '7 ngày', value: 'Week' },
  { label: 'Tháng này', value: 'Month' },
  { label: 'Năm nay', value: 'Year' },
];

// ─── SVG line chart (no external library) ─────────────────────────────────

function RevenueChart({
  data,
}: {
  data: { date: string; actualRevenue: number; projectedRevenue: number }[];
}) {
  if (!data.length)
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        Chưa có dữ liệu
      </div>
    );

  const W = 600;
  const H = 160;
  const PAD = { top: 12, right: 16, bottom: 28, left: 64 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.flatMap(d => [d.actualRevenue, d.projectedRevenue]), 1);
  const xScale = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * innerW;
  const yScale = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;

  const toPath = (key: 'actualRevenue' | 'projectedRevenue') =>
    data
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d[key]).toFixed(1)}`)
      .join(' ');

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y: PAD.top + innerH - t * innerH,
    label: formatPrice(maxVal * t),
  }));

  const step = Math.ceil(data.length / 6);
  const xTicks = data.filter((_, i) => i === 0 || i === data.length - 1 || i % step === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label="Biểu đồ doanh thu">
      {yTicks.map(t => (
        <g key={t.y}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={t.y}
            y2={t.y}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
          <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
            {t.label}
          </text>
        </g>
      ))}

      {/* Projected */}
      <path
        d={`${toPath('projectedRevenue')} L${xScale(data.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${PAD.left},${(PAD.top + innerH).toFixed(1)} Z`}
        fill="rgba(139,92,246,0.08)"
      />
      <path
        d={toPath('projectedRevenue')}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth={1.5}
        strokeDasharray="5,3"
      />

      {/* Actual */}
      <path
        d={`${toPath('actualRevenue')} L${xScale(data.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${PAD.left},${(PAD.top + innerH).toFixed(1)} Z`}
        fill="rgba(34,197,94,0.1)"
      />
      <path d={toPath('actualRevenue')} fill="none" stroke="#22c55e" strokeWidth={2} />

      {xTicks.map(d => {
        const i = data.indexOf(d);
        return (
          <text
            key={d.date}
            x={xScale(i)}
            y={H - 6}
            textAnchor="middle"
            fontSize={9}
            fill="#9ca3af"
          >
            {new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
          </text>
        );
      })}
    </svg>
  );
}

// ─── KPI card ──────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  growth,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: string;
  growth?: number | null;
}) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-lg ${accent}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {growth != null && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              growth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            }`}
          >
            {growth >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(growth).toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main dashboard ────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('Month');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-revenue-stats', timeRange],
    queryFn: () => revenueService.getStats(timeRange),
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: () => productService.getAll({ pageSize: 1 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {TIME_RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                timeRange === r.value
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Doanh thu thực"
          value={statsLoading ? '...' : formatPrice(stats?.actualRevenue ?? 0)}
          sub="Đơn đã hoàn thành"
          accent="bg-green-500"
          growth={stats?.growthRate}
        />
        <KpiCard
          icon={Clock}
          label="Doanh thu dự kiến"
          value={statsLoading ? '...' : formatPrice(stats?.projectedRevenue ?? 0)}
          sub="Đơn đang xử lý"
          accent="bg-violet-500"
        />
        <KpiCard
          icon={ShoppingBag}
          label="Đơn hàng"
          value={statsLoading ? '...' : String(stats?.totalOrders ?? 0)}
          sub={stats ? `${stats.successfulOrders} thành công` : undefined}
          accent="bg-primary"
        />
        <KpiCard
          icon={Package}
          label="Sản phẩm"
          value={String(products?.totalCount ?? 0)}
          accent="bg-cyan-500"
        />
      </div>

      {/* Revenue chart + breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
              Biểu đồ doanh thu
            </h2>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-green-500 inline-block rounded" />
                Thực tế
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-4 h-px bg-violet-400 inline-block rounded"
                  style={{ borderTop: '1px dashed' }}
                />
                Dự kiến
              </span>
            </div>
          </div>
          {statsLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <RevenueChart data={stats?.chartData ?? []} />
          )}
        </div>

        <div className="bg-card rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Phân tích doanh thu</h2>
          {statsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(
                [
                  {
                    label: 'Đã hoàn thành',
                    value: stats?.actualRevenue ?? 0,
                    icon: CheckCircle2,
                    color: 'text-green-600',
                    bg: 'bg-green-50',
                  },
                  {
                    label: 'Đang xử lý',
                    value: stats?.projectedRevenue ?? 0,
                    icon: Clock,
                    color: 'text-violet-600',
                    bg: 'bg-violet-50',
                  },
                  {
                    label: 'Đã huỷ',
                    value: stats?.cancelledRevenue ?? 0,
                    icon: XCircle,
                    color: 'text-red-500',
                    bg: 'bg-red-50',
                  },
                ] as const
              ).map(item => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-lg p-3 ${item.bg}`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`text-sm font-bold ${item.color}`}>{formatPrice(item.value)}</p>
                  </div>
                </div>
              ))}

              {stats?.growthRate != null && (
                <div className="mt-2 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tăng trưởng kỳ trước</span>
                  <span
                    className={`text-sm font-bold flex items-center gap-1 ${
                      stats.growthRate >= 0 ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {stats.growthRate >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {stats.growthRate >= 0 ? '+' : ''}
                    {stats.growthRate.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-card rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Top 5 sản phẩm bán chạy</h2>
        {statsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !stats?.topProducts?.length ? (
          <p className="text-sm text-muted-foreground">Chưa có dữ liệu trong kỳ này</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium w-8">#</th>
                  <th className="pb-2 font-medium">Sản phẩm</th>
                  <th className="pb-2 font-medium text-right">Đã bán</th>
                  <th className="pb-2 font-medium text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.topProducts.map((p, i) => {
                  const maxRevenue = stats.topProducts[0].totalRevenue;
                  const pct = maxRevenue ? (p.totalRevenue / maxRevenue) * 100 : 0;
                  return (
                    <tr key={p.productId} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 text-muted-foreground font-mono text-xs">{i + 1}</td>
                      <td className="py-3">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-medium truncate max-w-xs">{p.productName}</span>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden w-full max-w-[200px]">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium">
                        {p.totalQuantity.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 text-right font-semibold text-green-600">
                        {formatPrice(p.totalRevenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category count footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Tag className="h-3.5 w-3.5" />
        <span>{categories?.length ?? 0} danh mục đang hoạt động</span>
      </div>
    </div>
  );
}
