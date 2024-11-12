import { useRouter } from 'next/router';
import { useState } from 'react';
import { 
  Trash2, 
  FileEdit, 
  Share2, 
  Users
} from 'lucide-react';
import { documentsService } from '../lib/documents';

export function DocumentCard({ document }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNavigate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/document/${document.id}`);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    documentsService.shareDocument(document.id);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await documentsService.deleteDocument(document.id);
    } catch (error) {
      console.error('Error deleting document:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative group">
      <div className={`relative rounded-lg border border-white/5 p-6
        ${isDeleting ? 'opacity-50' : ''}
        hover:border-white/10 hover:bg-white/5
        transition-all duration-500`}
      >
        {/* Card Content */}
        <div className="space-y-6 relative z-10">
          {/* Document Title and Share Status */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleNavigate}
              className="text-lg font-light text-white/90 hover:text-white transition-colors text-left"
            >
              {document.title || 'Untitled Document'}
            </button>
            {document.isShared && (
              <div className="flex items-center text-white/40">
                <Users className="w-4 h-4" strokeWidth={1.25} />
              </div>
            )}
          </div>
          
          {/* Action Buttons - Moved to bottom, spread out */}
          <div className="flex items-center justify-end gap-6">
            <button
              onClick={handleShare}
              className="p-1.5 text-white/40 hover:text-white transition-all duration-300"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.25} />
            </button>
            <button
              onClick={handleNavigate}
              className="p-1.5 text-white/40 hover:text-white transition-all duration-300"
            >
              <FileEdit className="w-4 h-4" strokeWidth={1.25} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-white/40 hover:text-red-400 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.25} />
            </button>
          </div>
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 
          opacity-0 group-hover:opacity-100 transition-all duration-700" />
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/10 rounded-full 
          blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-emerald-500/10 rounded-full 
          blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700" />
      </div>

      {/* Ambient Highlight */}
      <div className="absolute -inset-px bg-gradient-to-r from-blue-500/30 to-emerald-500/30 
        opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-700 pointer-events-none" />
    </div>
  );
}