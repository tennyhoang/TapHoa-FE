import { Skeleton } from '@/components/ui/skeleton';

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-gray-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-gray-50">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Skeleton className="h-8 w-48 mb-6" />
      <TableSkeleton />
    </div>
  );
}
