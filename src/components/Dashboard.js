import { useEffect, useState } from 'react';
import { DocumentCard } from './DocumentCard';
import { NewDocumentButton } from './NewDocumentButton';
import { auth } from '../lib/firebase';
import { documentsService } from '../lib/documents';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = documentsService.subscribeToUserDocuments(
      user.uid,
      (docs) => setDocuments(docs)
    );

    return () => unsubscribe();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Ambient background effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 to-emerald-900/20 pointer-events-none" />
      
      {/* Header */}
      <header className="relative border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <h1 className="text-white font-medium">Documents</h1>
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
