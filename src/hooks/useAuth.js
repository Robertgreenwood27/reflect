import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start loading state
    setLoading(true);
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', { 
        userId: user?.uid,
        isAuthenticated: !!user 
      });
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}