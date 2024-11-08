import React, { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { debounce } from 'lodash';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';

const COOLING_DURATION = 120000; // 2 minutes in milliseconds

const LivePaper = ({ documentId, initialContent = [] }) => {
  const [textSegments, setTextSegments] = useState(initialContent);
  const [isSynced, setIsSynced] = useState(true);
  const textareaRef = useRef(null);
  const lastTextRef = useRef('');
  const router = useRouter();

  const getColorForAge = (timestamp) => {
    const age = Date.now() - timestamp;
    const progress = Math.min(age / COOLING_DURATION, 1);
    
    const r = Math.round(255 - (progress * 180));
    const g = Math.round(170 - (progress * 170));
    const b = Math.round(100 + (progress * 155));
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const isTextCold = (timestamp) => {
    return (Date.now() - timestamp) >= COOLING_DURATION;
  };

  const getColdTextLength = () => {
    return textSegments.reduce((sum, segment) => {
      return sum + (isTextCold(segment.timestamp) ? segment.text.length : 0);
    }, 0);
  };

  const debouncedSync = useRef(
    debounce((newSegments) => {
      syncContent(newSegments);
    }, 1000)
  ).current;

  useEffect(() => {
    const pusher = new Pusher('f698ef5791fa3bf159bd', {
      cluster: 'us3'
    });

    const channel = pusher.subscribe('live-paper');
    
    channel.bind('text-update', (data) => {
      if (data.segments) {
        setTextSegments(data.segments);
        setIsSynced(true);
      }
    });

    const colorInterval = setInterval(() => {
      setTextSegments(prev => [...prev]); // Force re-render to update colors
    }, 100);

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
      clearInterval(colorInterval);
      debouncedSync.cancel();
    };
  }, []);

  const syncContent = async (newSegments) => {
    try {
      // First sync with Pusher for real-time updates
      await fetch('/api/pusher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ segments: newSegments }),
      });

      // Then update Firestore with only the cold segments
      const coldSegments = newSegments.filter(segment => 
        isTextCold(segment.timestamp)
      );
      
      if (coldSegments.length > 0) {
        const docRef = doc(db, 'documents', documentId);
        await updateDoc(docRef, {
          content: coldSegments,
          lastModified: Date.now()
        });
      }
      
      setIsSynced(true);
    } catch (error) {
      console.error('Error syncing:', error);
      setIsSynced(false);
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    const currentTime = Date.now();
    const coldLength = getColdTextLength();
    const lastText = lastTextRef.current;
    
    // Get the cursor position and selection
    const cursorPosition = e.target.selectionStart;
    const selectionEnd = e.target.selectionEnd;

    // If trying to edit cold text, prevent the change
    if (cursorPosition < coldLength) {
      e.target.value = textSegments.map(s => s.text).join('');
      e.target.setSelectionRange(coldLength, coldLength);
      return;
    }

    let newSegments = [];
    let currentPosition = 0;

    // Keep all cold segments unchanged
    for (const segment of textSegments) {
      if (isTextCold(segment.timestamp)) {
        newSegments.push(segment);
        currentPosition += segment.text.length;
      } else {
        break;
      }
    }

    // Find what text was actually added or changed
    const warmSegments = textSegments.slice(newSegments.length);
    const oldWarmText = warmSegments.map(s => s.text).join('');
    const newWarmText = newText.slice(currentPosition);

    if (oldWarmText !== newWarmText) {
      // Find the common prefix length
      let prefixLength = 0;
      while (prefixLength < oldWarmText.length && 
             prefixLength < newWarmText.length && 
             oldWarmText[prefixLength] === newWarmText[prefixLength]) {
        prefixLength++;
      }

      // Keep existing segments up to the change point
      let processedLength = 0;
      for (const segment of warmSegments) {
        if (processedLength + segment.text.length <= prefixLength) {
          newSegments.push(segment);
          processedLength += segment.text.length;
        } else if (processedLength < prefixLength) {
          // Split this segment
          const keepLength = prefixLength - processedLength;
          newSegments.push({
            text: segment.text.slice(0, keepLength),
            timestamp: segment.timestamp
          });
          break;
        } else {
          break;
        }
      }

      // Add the new text as a fresh segment
      if (prefixLength < newWarmText.length) {
        newSegments.push({
          text: newWarmText.slice(prefixLength),
          timestamp: currentTime
        });
      }
    } else {
      // No changes to warm text, keep existing segments
      newSegments = [...textSegments];
    }

    setTextSegments(newSegments);
    lastTextRef.current = newText;
    setIsSynced(false);
    debouncedSync(newSegments);

    // Restore cursor position after React update
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(cursorPosition, selectionEnd);
      }
    });
  };

  const renderSegments = () => {
    return textSegments.map((segment, index) => (
      <span 
        key={`${index}-${segment.timestamp}`}
        style={{ 
          color: getColorForAge(segment.timestamp),
          transition: 'color 0.1s ease',
          whiteSpace: 'pre-wrap'
        }}
      >
        {segment.text}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
        <div className="flex items-center justify-between text-sm mb-2">
          <button 
            onClick={() => router.push('/')}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 -ml-1"
            aria-label="Back to documents"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            {isSynced ? (
              <span className="text-emerald-500">Saved</span>
            ) : (
              <span className="text-zinc-500">Editing...</span>
            )}
          </div>
        </div>
        <div className="relative flex-grow">
          <textarea
            ref={textareaRef}
            value={textSegments.map(s => s.text).join('')}
            onChange={handleTextChange}
            className="absolute inset-0 w-full h-full resize-none bg-transparent 
                     text-transparent caret-white whitespace-pre-wrap
                     placeholder-zinc-600 p-8 text-lg leading-relaxed
                     focus:outline-none focus:ring-0"
            placeholder="Begin writing..."
            autoFocus
            spellCheck="false"
          />
          <div className="absolute inset-0 w-full h-full p-8 text-lg leading-relaxed pointer-events-none whitespace-pre-wrap">
            {renderSegments()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePaper;