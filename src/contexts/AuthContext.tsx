import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of the user object that will be stored in the context state
interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  fullName?: string;
  role?: 'user' | 'admin'; // Changed: role is a direct property
  // The user_metadata property is no longer needed here based on our backend
}

// Define the types for the context value
interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  adminSignIn: (username: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On initial load, try to get the user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('loggedInUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }
      setUser(data.user);
      localStorage.setItem('loggedInUser', JSON.stringify(data.user));
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const adminSignIn = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid admin credentials');
      }
      setUser(data.user);
      localStorage.setItem('loggedInUser', JSON.stringify(data.user));
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      return { error: null };
    } catch (error: any) {
      if (error.message.includes("Unexpected end of JSON input")) {
        return { error: null };
      }
      return { error };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('loggedInUser');
  };


  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
    adminSignIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access to the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}