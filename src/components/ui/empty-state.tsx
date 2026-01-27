import { SearchX } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: Status role is appropriate for empty state message
    <div className="flex flex-col items-center justify-center py-12 px-4" role="status">
      <div className="text-muted-foreground mb-4" aria-hidden="true">
        {icon || <SearchX className="w-12 h-12" />}
      </div>
      <h3 className="text-xl font-semibold text-center">{title}</h3>
      <p className="text-muted-foreground mt-2 text-center max-w-md">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
