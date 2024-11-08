// src/pages/login.js
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="bg-zinc-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">Live Paper</h1>
        <button
          onClick={handleSignIn}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 
                   transition-colors flex items-center justify-center gap-2"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}