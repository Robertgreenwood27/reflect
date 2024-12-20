import { useEffect, useState } from 'react';
import { DocumentCard } from './DocumentCard';
import { NewDocumentButton } from './NewDocumentButton';
import { auth } from '../lib/firebase';
import { documentsService } from '../lib/documents';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    console.log('Dashboard useEffect - user state changed:', user?.uid);
    
    let unsubscribe = () => {};

    if (user) {
      setLoading(true);
      unsubscribe = documentsService.subscribeToUserDocuments(
        user.uid,
        (docs) => {
          console.log('Received documents update:', {
            count: docs.length,
            ids: docs.map(d => d.id)
          });
          setDocuments(docs);
          setLoading(false);
        }
      );
    } else {
      setDocuments([]);
      setLoading(false);
    }

    return () => {
      console.log('Cleaning up documents subscription');
      unsubscribe();
    };
  }, [user]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Ambient background effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 to-emerald-900/20 pointer-events-none" />
      
      {/* Header */}
      <header className="relative border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <h1 className="text-white font-medium">Documents ({documents.length})</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="relative max-w-4xl mx-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>

        <NewDocumentButton />
      </div>
    </div>
  );
}
