// src/components/AuthGuard.js
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return user ? children : null;
}