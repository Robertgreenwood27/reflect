import React, { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';
import { debounce } from 'lodash';

const COOLING_DURATION = 30000; // 30 seconds in milliseconds
const TYPING_DEBOUNCE = 500; // Wait 500ms after typing to sync

const LivePaper = ({ documentId, initialContent = [] }) => {
  const [textSegments, setTextSegments] = useState(initialContent);
  const [isSynced, setIsSynced] = useState(true);
  const textareaRef = useRef(null);
  const lastTextRef = useRef('');
  const router = useRouter();
  const hasUnsavedChanges = useRef(false);

  // Debounced Pusher sync
  const debouncedPusherSync = useRef(
    debounce((segments) => {
      fetch('/api/pusher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segments }),
      }).then(() => setIsSynced(true))
        .catch(() => setIsSynced(false));
    }, TYPING_DEBOUNCE)
  ).current;

  // Save to Firestore only on exit
  const saveToFirestore = async () => {
    if (!hasUnsavedChanges.current) return;
    
    try {
      const docRef = doc(db, 'documents', documentId);
      await updateDoc(docRef, {
        content: [{
          text: textSegments.map(s => s.text).join(''),
          timestamp: Date.now() - COOLING_DURATION // Save as cold text
        }],
        lastModified: Date.now()
      });
      hasUnsavedChanges.current = false;
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  };

  const handleBack = async () => {
    await saveToFirestore();
    router.push('/');
  };

  // Handle page exit
  useEffect(() => {
    const handleUnload = () => {
      if (hasUnsavedChanges.current) {
        // Use sendBeacon for synchronous send before page close
        const data = {
          content: [{
            text: textSegments.map(s => s.text).join(''),
            timestamp: Date.now() - COOLING_DURATION
          }],
          lastModified: Date.now()
        };

        navigator.sendBeacon(
          `/api/save-document/${documentId}`, 
          JSON.stringify(data)
        );
      }
    };

    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('unload', handleUnload);
      debouncedPusherSync.cancel();
    };
  }, []);

  // Real-time collaboration setup
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
    };
  }, []);

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

  const handleTextChange = (e) => {
    const newText = e.target.value;
    const currentTime = Date.now();
    const coldLength = getColdTextLength();
    
    // Prevent editing cold text
    if (e.target.selectionStart < coldLength) {
      e.target.value = textSegments.map(s => s.text).join('');
      e.target.setSelectionRange(coldLength, coldLength);
      return;
    }

    // Create new segment for the change
    const newSegments = [
      ...textSegments.filter(s => isTextCold(s.timestamp)),
      {
        text: newText.slice(coldLength),
        timestamp: currentTime
      }
    ];

    setTextSegments(newSegments);
    lastTextRef.current = newText;
    hasUnsavedChanges.current = true;
    setIsSynced(false);
    
    // Debounced sync to Pusher
    debouncedPusherSync(newSegments);
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
            onClick={handleBack}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 -ml-1"
            aria-label="Back to documents"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            {isSynced ? (
              <span className="text-emerald-500">●</span>
            ) : (
              <span className="text-zinc-500">○</span>
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
            placeholder="Write..."
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
