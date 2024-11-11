import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth listener');
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  return { user, loading };
}