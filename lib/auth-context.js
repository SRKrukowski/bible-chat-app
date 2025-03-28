/**
 * Authentication Context Provider
 * 
 * This component provides authentication state and functions
 * to the entire application using React Context.
 */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Create the authentication context
const AuthContext = createContext();

/**
 * Authentication Provider Component
 * Wraps the application to provide authentication state and functions
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user on initial mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/user');
        const data = await res.json();
        
        if (data.success) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Result of registration
   */
  const register = async (userData) => {
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setUser(data.data.user);
        router.push('/');
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in a user
   * @param {Object} credentials - User login credentials
   * @returns {Promise<Object>} Result of login
   */
  const login = async (credentials) => {
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setUser(data.data.user);
        router.push('/');
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out the current user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Update the current user's profile
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Result of update
   */
  const updateProfile = async (updates) => {
    try {
      const res = await fetch('/api/auth/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setUser(data.data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Context value
  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use the authentication context
 * @returns {Object} Authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
