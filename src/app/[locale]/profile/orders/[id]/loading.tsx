import { Skeleton } from '@/components/ui/skeleton';

export default function OrderDetailLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
    </div>
  );
}
