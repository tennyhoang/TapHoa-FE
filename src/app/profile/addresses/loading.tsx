import { Skeleton } from '@/components/ui/skeleton';

export default function AddressesLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-64" />
        </div>
      ))}
    </div>
  );
}
