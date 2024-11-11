import { useState, useEffect } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { documentsService } from '../lib/documents';

export function DocumentEditor({ documentId }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  
  // Load document content once on initial load
  useEffect(() => {
    async function loadDocument() {
      if (!documentId) return;
      
      try {
        const docRef = doc(db, 'documents', documentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setContent(docSnap.data().content || '');
        }
      } catch (error) {
        console.error('Error loading document:', error);
      }
    }
    
    loadDocument();
  }, [documentId]);

  const handleChange = (e) => {
    setContent(e.target.value);
  };

  const handleBack = async () => {
    try {
      await documentsService.updateDocument(documentId, content);
      router.push('/');
    } catch (error) {
      console.error('Error saving document:', error);
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Subtle ambient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 to-emerald-900/10 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button 
            onClick={() => documentsService.shareDocument(documentId)}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Document */}
      <main className="pt-14">
        <div className="max-w-3xl mx-auto min-h-screen">
          <textarea
            value={content}
            onChange={handleChange}
            placeholder="Start typing..."
            className="w-full min-h-screen bg-transparent p-8 text-lg text-white/90 
              placeholder-blue-200/30 focus:outline-none resize-none"
          />
        </div>
      </main>
    </div>
  );
}