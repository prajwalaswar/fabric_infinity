import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAdminMe } from '@workspace/api-client-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: admin, isLoading, error } = useAdminMe();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !admin) {
      setLocation('/admin/login');
    }
  }, [admin, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!admin) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
