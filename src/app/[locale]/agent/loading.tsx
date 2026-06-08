import { Skeleton } from '@/components/ui/skeleton';

export default function AgentLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}
