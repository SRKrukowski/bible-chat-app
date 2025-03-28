/**
 * Message List Component
 * 
 * This component displays a list of chat messages.
 */

'use client';

import { useChat } from '@/lib/chat/chat-context';
import { useAuth } from '@/lib/auth/auth-context';
import { useEffect, useRef } from 'react';

export default function MessageList() {
  const { messages, loading, error } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No messages yet. Be the first to start the discussion!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4 max-h-[60vh] overflow-y-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.user_id === user?.id ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
              message.user_id === user?.id
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            <div className="font-bold text-sm">
              {message.user_id === user?.id ? 'You' : message.user_name}
            </div>
            <div className="mt-1">{message.content}</div>
            <div className="text-xs mt-1 opacity-70">
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
