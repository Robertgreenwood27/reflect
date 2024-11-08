// src/pages/documents/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getDocument } from '@/lib/firestore';
import { AuthGuard } from '@/components/AuthGuard';
import LivePaper from '@/components/LivePaper';

function Document() {
  const router = useRouter();
  const { id } = router.query;
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState(null);

  useEffect(() => {
    async function fetchDocument() {
      if (id) {
        try {
          const doc = await getDocument(id);
          setDocument(doc);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchDocument();
  }, [id]);

  // This handles both page close and actual content
  const saveDocument = async (content) => {
    try {
      const docRef = doc(db, 'documents', id);
      await updateDoc(docRef, {
        content,
        lastModified: Date.now()
      });
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  useEffect(() => {
    // Save on page close/refresh
    const handleUnload = () => {
      if (content) {
        // Using sendBeacon for reliable saving on page close
        const data = new Blob(
          [JSON.stringify({ content, lastModified: Date.now() })], 
          { type: 'application/json' }
        );
        navigator.sendBeacon(`/api/documents/${id}/save`, data);
      }
    };

    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, [id, content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900">
        <div className="text-emerald-500/30">...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-900">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={() => router.push('/')}
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Return to documents
        </button>
      </div>
    );
  }

  return (
    <LivePaper 
      documentId={id} 
      initialContent={document.content}
      onContentChange={setContent}
      onSave={saveDocument}
    />
  );
}

export default function DocumentPage() {
  return (
    <AuthGuard>
      <Document />
    </AuthGuard>
  );
}