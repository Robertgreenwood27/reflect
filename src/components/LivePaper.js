import React, { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { debounce } from 'lodash';

const COOLING_DURATION = 120000; // 2 minutes in milliseconds

const LivePaper = () => {
  const [textSegments, setTextSegments] = useState([]);
  const [isSynced, setIsSynced] = useState(true);
  const textareaRef = useRef(null);
  const lastCursorPosition = useRef(null);

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
      const response = await fetch('/api/pusher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ segments: newSegments }),
      });
      
      if (response.ok) {
        setIsSynced(true);
      }
    } catch (error) {
      console.error('Error syncing:', error);
      setIsSynced(false);
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    const currentTime = Date.now();
    const coldLength = getColdTextLength();
    
    // Get the cursor position and selection
    const cursorPosition = e.target.selectionStart;
    const selectionEnd = e.target.selectionEnd;
    lastCursorPosition.current = cursorPosition;

    // If trying to edit cold text, prevent the change
    if (cursorPosition < coldLength) {
      // Restore the textarea to its previous state
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

    // Add the new text as a fresh segment, preserving line breaks
    if (currentPosition < newText.length) {
      const newContent = newText.slice(currentPosition);
      newSegments.push({
        text: newContent,
        timestamp: currentTime
      });
    }

    setTextSegments(newSegments);
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
          whiteSpace: 'pre-wrap'  // This preserves whitespace and line breaks
        }}
      >
        {segment.text}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
        <div className="text-sm mb-2">
          {isSynced ? (
            <span className="text-emerald-500">Saved</span>
          ) : (
            <span className="text-zinc-500">Editing...</span>
          )}
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