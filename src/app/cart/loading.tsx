import { Skeleton } from '@/components/ui/skeleton';

export default function CartLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-8 w-40" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 bg-white rounded-xl p-4 border border-gray-100">
          <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
      <Skeleton className="h-36 rounded-xl" />
    </div>
  );
}
