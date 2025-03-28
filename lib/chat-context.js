/**
 * Chat Context Provider
 * 
 * This component provides chat state and functions
 * to the application using React Context.
 */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

// Create the chat context
const ChatContext = createContext();

/**
 * Chat Provider Component
 * Wraps the application to provide chat state and functions
 */
export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Load today's messages on initial mount and when user changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchTodaysMessages();
    }
  }, [isAuthenticated]);

  // Set up polling for new messages every 5 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchTodaysMessages(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  /**
   * Fetch today's messages
   * @param {boolean} showLoading - Whether to show loading state
   */
  const fetchTodaysMessages = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const res = await fetch('/api/messages/today');
      const data = await res.json();
      
      if (data.success) {
        setMessages(data.data.messages);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('An unexpected error occurred');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  /**
   * Send a new message
   * @param {string} content - Message content
   * @returns {Promise<Object>} Result of sending message
   */
  const sendMessage = async (content) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Add the new message to the list
        setMessages((prevMessages) => [...prevMessages, data.data.message]);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  /**
   * Fetch messages for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   */
  const fetchMessagesByDate = async (date) => {
    setLoading(true);
    
    try {
      const res = await fetch(`/api/messages/date/${date}`);
      const data = await res.json();
      
      if (data.success) {
        setMessages(data.data.messages);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    messages,
    loading,
    error,
    sendMessage,
    fetchTodaysMessages,
    fetchMessagesByDate,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Hook to use the chat context
 * @returns {Object} Chat context
 */
export function useChat() {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
}
