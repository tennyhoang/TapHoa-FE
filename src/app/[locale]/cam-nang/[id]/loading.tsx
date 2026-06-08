import { Skeleton } from '@/components/ui/skeleton';

export default function ArticleDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-8 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-28" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
