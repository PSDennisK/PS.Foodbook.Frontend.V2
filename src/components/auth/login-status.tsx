'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export function LoginStatus() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Ingelogd</span>
      <Button variant="outline" size="sm" onClick={logout}>
        Uitloggen
      </Button>
    </div>
  );
}
