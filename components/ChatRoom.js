/**
 * Chat Room Component
 * 
 * This component combines the reading display, message list, and message input
 * to create a complete chat room for Bible verse discussions.
 */

'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/lib/chat/chat-context';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';

export default function ChatRoom({ readings }) {
  const [activeTab, setActiveTab] = useState('chat');
  const { loading } = useChat();
  
  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b bg-white">
        <button
          onClick={() => setActiveTab('readings')}
          className={`px-4 py-3 text-sm font-medium ${
            activeTab === 'readings'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Today's Readings
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-3 text-sm font-medium ${
            activeTab === 'chat'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Discussion
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-grow overflow-hidden">
        {activeTab === 'readings' ? (
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {readings ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">{readings.liturgicalDay}</h2>
                <p className="text-gray-500 mb-6">{readings.date}</p>
                
                {readings.readings.map((reading, index) => (
                  <div key={index} className="mb-8">
                    <h3 className="text-xl font-semibold mb-2">{reading.title}</h3>
                    <p className="text-gray-600 mb-3">{reading.reference}</p>
                    <div className="prose max-w-none">
                      {reading.content.split('\n\n').map((paragraph, i) => (
                        <p key={i} className="mb-4">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-hidden">
              <MessageList />
            </div>
            <MessageInput />
          </div>
        )}
      </div>
    </div>
  );
}
