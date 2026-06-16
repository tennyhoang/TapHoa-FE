import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  rating: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const sizeMap = { xs: 'h-3 w-3', sm: 'h-3.5 w-3.5', md: 'h-4 w-4' };

export function StarRating({ rating, size = 'md', className }: Props) {
  return (
    <div className={cn('flex', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeMap[size],
            i < Math.round(rating)
              ? 'fill-[var(--amber)] text-[var(--amber)]'
              : 'text-border'
          )}
        />
      ))}
    </div>
  );
}
