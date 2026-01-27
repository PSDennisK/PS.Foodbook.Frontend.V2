import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 9 }: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static and never reordered
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3 mt-2" />
          </div>
        </Card>
      ))}
    </div>
  );
}
