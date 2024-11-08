// src/pages/login.js
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { user, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <button
        onClick={handleSignIn}
        className="aspect-square w-16 rounded-sm
                 border border-emerald-900/20 bg-black
                 group relative overflow-hidden
                 transition-all duration-500"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                      bg-gradient-to-br from-emerald-900/20 via-blue-900/10 to-transparent
                      transition-opacity duration-700" />
        <LogIn 
          className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   text-emerald-700 group-hover:text-emerald-500/70
                   transition-colors duration-500" 
        />
      </button>
    </div>
  );
}