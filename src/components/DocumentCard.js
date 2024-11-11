import { formatDistance } from 'date-fns';
import { useRouter } from 'next/router';

export function DocumentCard({ document }) {
  const router = useRouter();

  // Convert Firestore timestamp to readable date string
  const getFormattedDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    // Handle both Firestore timestamps and regular Date objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistance(date, new Date(), { addSuffix: true });
  };

  const handleClick = () => {
    router.push(`/document/${document.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-900/40 to-emerald-900/40 p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300"
    >
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative space-y-2">
        <h3 className="text-lg font-medium text-white">
          {document.title || 'Untitled Document'}
        </h3>
        <p className="text-sm text-blue-200">
          {getFormattedDate(document.updatedAt)}
        </p>
        {document.isShared && (
          <div className="inline-flex items-center px-2 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs">
            Shared
          </div>
        )}
      </div>
      
      {/* Liquid effect on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
    </div>
  );
}
