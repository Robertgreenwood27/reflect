// src/pages/index.js
import { useAuth } from '@/components/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';
import { useEffect, useState } from 'react';
import { getUserDocuments, createDocument, deleteDocument } from '@/lib/firestore';
import { useRouter } from 'next/router';
import { Plus, LogOut } from 'lucide-react';

function DocumentList() {
  const { user, signOut } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchDocuments() {
      if (user) {
        try {
          const docs = await getUserDocuments(user.uid);
          setDocuments(docs);
        } catch (error) {
          console.error('Error fetching documents:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchDocuments();
  }, [user]);

  const handleCreateDocument = async () => {
    try {
      const docId = await createDocument(user.uid);
      router.push(`/documents/${docId}`);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleDelete = async (e, docId) => {
    e.stopPropagation();
    try {
      await deleteDocument(docId);
      setDocuments(documents.filter(doc => doc.id !== docId));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-emerald-500/30">...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-emerald-300/70">
      <button
        onClick={signOut}
        className="fixed top-4 right-4 w-8 h-8 rounded-sm
                 border border-red-900/20 bg-black
                 group relative overflow-hidden
                 transition-all duration-500"
        aria-label="Sign out"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                      bg-gradient-to-br from-red-900/20 via-red-800/10 to-transparent
                      transition-opacity duration-700" />
        <LogOut 
          className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   text-red-700 group-hover:text-red-500/70
                   transition-colors duration-500" 
        />
      </button>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 mt-8">
          {/* New Document Button */}
          <button
            onClick={handleCreateDocument}
            className="aspect-square rounded-sm
                     border border-emerald-900/20 bg-black
                     group relative overflow-hidden
                     transition-all duration-500"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                          bg-gradient-to-br from-emerald-900/20 via-blue-900/10 to-transparent
                          transition-opacity duration-700" />
            <Plus 
              className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       text-emerald-700 group-hover:text-emerald-500/70
                       transition-colors duration-500" 
            />
          </button>

          {/* Document Cards */}
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => router.push(`/documents/${doc.id}`)}
              className="aspect-square rounded-sm cursor-pointer
                       border border-emerald-900/20 bg-black
                       group relative overflow-hidden
                       transition-all duration-500"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                          bg-gradient-to-br from-emerald-900/20 via-blue-900/10 to-transparent
                          transition-opacity duration-700" />
              
              {/* Delete Button */}
              <button
                onClick={(e) => handleDelete(e, doc.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
                         transition-opacity duration-300"
                aria-label="Delete document"
              >
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 14 14" 
                  fill="none" 
                  className="stroke-red-700 hover:stroke-red-500/70"
                  strokeWidth="1"
                >
                  <path d="M1 1L13 13M1 13L13 1" />
                </svg>
              </button>

              {/* Document Title */}
              <div className="absolute bottom-2 left-2 right-2 truncate text-sm text-emerald-700
                            group-hover:text-emerald-500/70 transition-colors duration-500">
                {doc.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <DocumentList />
    </AuthGuard>
  );
}