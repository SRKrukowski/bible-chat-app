/**
 * Main Page Component
 * 
 * This component serves as the main page of the Bible Chat App,
 * displaying the daily readings and chat interface.
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { ChatProvider } from '@/lib/chat/chat-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChatRoom from '@/components/ChatRoom';

export default function HomePage() {
  const [readings, setReadings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();

  // Fetch today's readings when the component mounts
  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const res = await fetch('/api/readings/today');
        const data = await res.json();
        
        if (data.success) {
          setReadings(data.data);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch readings');
        }
      } catch (error) {
        console.error('Error fetching readings:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Bible Chat</h1>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Welcome, {user.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <ChatProvider>
              <ChatRoom readings={readings} />
            </ChatProvider>
          )}
        </main>
        
        <footer className="bg-white border-t mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500 text-sm">
            <p>Bible Chat App &copy; {new Date().getFullYear()}</p>
            <p className="mt-1">Daily readings from USCCB and API.Bible</p>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
