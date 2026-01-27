import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Skeleton */}
        <Card className="p-6">
          <Skeleton className="aspect-square w-full rounded-md" />
        </Card>

        {/* Info Skeleton */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>

          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <Card className="p-6">
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </Card>
    </div>
  );
}
