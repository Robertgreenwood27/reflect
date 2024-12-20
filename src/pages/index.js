import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Dashboard } from '../components/Dashboard';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Home() {
  const { user, loading } = useAuth();

  // Add debugging
  useEffect(() => {
    console.log('Auth State:', { user, loading });
  }, [user, loading]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log('Attempting Google sign in...');
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  // Add loading state handling
  if (loading) {
    console.log('Loading auth state...');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  // Check auth state
  if (!user) {
    console.log('No user found, showing login page');
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
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

  console.log('User found, showing dashboard');
  return <Dashboard />;
}