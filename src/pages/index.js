// src/pages/index.js
import { useAuth } from '@/components/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';
import { useEffect, useState } from 'react';
import { getUserDocuments, createDocument } from '@/lib/firestore';
import { useRouter } from 'next/router';

function DocumentList() {
  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">My Documents</h1>
        <button
          onClick={handleCreateDocument}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                   transition-colors"
        >
          New Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400 mb-4">No documents yet</p>
          <button
            onClick={handleCreateDocument}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Create your first document
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => router.push(`/documents/${doc.id}`)}
              className="p-4 bg-zinc-800 rounded cursor-pointer hover:bg-zinc-700 
                       transition-colors"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-white font-medium">{doc.title}</h2>
                <span className="text-zinc-400 text-sm">
                  {new Date(doc.lastModified).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
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