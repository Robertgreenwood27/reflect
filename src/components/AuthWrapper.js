import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export function AuthWrapper({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        {/* Ambient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 to-emerald-900/20 pointer-events-none" />
        
        <div className="relative space-y-8 text-center">
          <h1 className="text-4xl font-bold text-white">Welcome</h1>
          <button
            onClick={signInWithGoogle}
            className="group relative px-6 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-emerald-500/50 rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            <span className="relative flex items-center justify-center gap-3">
              Sign in with Google
            </span>
          </button>
        </div>
      </div>
    );
  }

  return children;
}