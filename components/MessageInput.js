/**
 * Message Input Component
 * 
 * This component provides a form for sending new chat messages.
 */

'use client';

import { useState } from 'react';
import { useChat } from '@/lib/chat/chat-context';

export default function MessageInput() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { sendMessage } = useChat();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setSending(true);
    
    try {
      const result = await sendMessage(message.trim());
      
      if (result.success) {
        setMessage('');
      } else {
        alert(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An unexpected error occurred');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
      <div className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
