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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Loading document...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={() => router.push('/')}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Return to documents
        </button>
      </div>
    );
  }

  return <LivePaper documentId={id} initialContent={document.content} />;
}

export default function DocumentPage() {
  return (
    <AuthGuard>
      <Document />
    </AuthGuard>
  );
}