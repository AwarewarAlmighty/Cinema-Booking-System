import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

// Mock data that would conceptually be in local JSON files
const mockUsers = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    email: 'user@example.com',
    password: 'password123',
    user_metadata: {
      full_name: 'John Doe',
      role: 'user',
    },
  },
];

const mockAdmins = [
  {
    id: 'fedcba09-8765-4321-0987-654321fedcba',
    username: 'admin',
    password: 'password',
    user_metadata: {
      full_name: 'Admin User',
      role: 'admin',
    },
  },
];

interface AuthUser extends User {
  user_metadata?: {
    full_name?: string;
    role?: 'user' | 'admin';
  };
}

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

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const sessionUser = { ...foundUser, aud: 'authenticated' } as AuthUser;
      setUser(sessionUser);
      localStorage.setItem('loggedInUser', JSON.stringify(sessionUser));
      return { error: null };
    }

    return { error: { message: 'Invalid credentials' } };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return { error: { message: 'User with this email already exists' } };
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      user_metadata: {
        full_name: fullName,
        role: 'user',
      },
    };

    mockUsers.push(newUser);
    const sessionUser = { ...newUser, aud: 'authenticated' } as AuthUser;
    setUser(sessionUser);
    localStorage.setItem('loggedInUser', JSON.stringify(sessionUser));
    
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('loggedInUser');
  };

  const adminSignIn = async (username: string, password: string) => {
    const foundAdmin = mockAdmins.find(
      (a) => a.username === username && a.password === password
    );

    if (foundAdmin) {
      const sessionUser = {
        id: foundAdmin.id,
        user_metadata: foundAdmin.user_metadata,
        aud: 'authenticated',
      } as AuthUser;
      setUser(sessionUser);
      localStorage.setItem('loggedInUser', JSON.stringify(sessionUser));
      return { error: null };
    }

    return { error: { message: 'Invalid admin credentials' } };
  };

  const isAdmin = user?.user_metadata?.role === 'admin';

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
