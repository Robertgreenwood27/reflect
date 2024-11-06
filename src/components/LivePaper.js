import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js';

const LivePaper = () => {
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    Pusher.logToConsole = true;

    const pusher = new Pusher('f698ef5791fa3bf159bd', {
      cluster: 'us3'
    });

    const channel = pusher.subscribe('live-paper');
    
    channel.bind('text-update', (data) => {
      console.log('Received update:', data);
      setText(data.text);
    });

    pusher.connection.bind('connected', () => {
      console.log('Connected to Pusher');
      setConnected(true);
    });

    pusher.connection.bind('disconnected', () => {
      console.log('Disconnected from Pusher');
      setConnected(false);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  const handleTextChange = async (e) => {
    const newText = e.target.value;
    setText(newText);
    
    try {
      console.log('Sending update:', newText);
      const response = await fetch('/api/pusher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newText }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
    } catch (error) {
      console.error('Error sending update:', error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
        {connected ? (
          <div className="text-zinc-500 text-sm mb-2">Connected</div>
        ) : (
          <div className="text-red-500 text-sm mb-2">Disconnected</div>
        )}
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