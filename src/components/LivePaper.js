import React, { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

const LivePaper = () => {
  const [text, setText] = useState('');
  const [isSynced, setIsSynced] = useState(true);
  const [lastSyncedText, setLastSyncedText] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    const pusher = new Pusher('f698ef5791fa3bf159bd', {
      cluster: 'us3'
    });

    const channel = pusher.subscribe('live-paper');
    
    channel.bind('text-update', (data) => {
      // Only update if we're not currently editing
      if (data.text !== lastSyncedText) {
        console.log('Received update');
        setText(data.text);
        setLastSyncedText(data.text);
        setIsSynced(true);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [lastSyncedText]);

  const syncContent = async (content) => {
    try {
      const response = await fetch('/api/pusher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });
      
      if (response.ok) {
        setLastSyncedText(content);
        setIsSynced(true);
      }
    } catch (error) {
      console.error('Error syncing:', error);
      setIsSynced(false);
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setIsSynced(false);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to sync after 1 second of no typing
    timeoutRef.current = setTimeout(() => {
      syncContent(newText);
    }, 1000);
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
        <textarea
          value={text}
          onChange={handleTextChange}
          className="w-full flex-grow resize-none bg-zinc-900 text-zinc-100 
                     placeholder-zinc-600 p-8 text-lg leading-relaxed
                     focus:outline-none focus:ring-0
                     selection:bg-zinc-700 selection:text-zinc-100"
          placeholder="Begin writing..."
          autoFocus
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default LivePaper;