import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { documentsService } from '../lib/documents';

export function DocumentTitleEditor({ documentId, initialTitle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle || 'Untitled Document');
  const [previousTitle, setPreviousTitle] = useState('');

  useEffect(() => {
    setTitle(initialTitle || 'Untitled Document');
  }, [initialTitle]);

  const handleEdit = () => {
    setPreviousTitle(title);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setTitle(previousTitle);
      setIsEditing(false);
      return;
    }

    try {
      await documentsService.updateTitle(documentId, title.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating title:', error);
      setTitle(previousTitle);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTitle(previousTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-white/5 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="p-1 text-green-400 hover:text-green-300 transition-colors"
            aria-label="Save title"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-400 hover:text-red-300 transition-colors"
            aria-label="Cancel editing"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <h1
          onClick={handleEdit}
          className="text-lg font-medium text-white cursor-pointer hover:text-blue-200 transition-colors"
        >
          {title}
        </h1>
      )}
    </div>
  );
}