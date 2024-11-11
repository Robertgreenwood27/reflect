import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { documentsService } from '../lib/documents';
import { useAuth } from '../hooks/useAuth';

export function NewDocumentButton() {
  const router = useRouter();
  const { user } = useAuth();

  const handleClick = async () => {
    try {
      const docRef = await documentsService.createDocument(user.uid);
      router.push(`/document/${docRef.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="group fixed bottom-8 right-8 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
      <PlusCircle className="w-12 h-12 relative text-white group-hover:scale-110 transition-transform duration-300" />
    </button>
  );
}
