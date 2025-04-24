import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerWithEmailAndPassword, logoutUser, loginWithEmailAndPassword } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

type User = {
  id: number;
  username: string;
  balance: number;
  email?: string;
  referralCode?: string;
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  register: (username: string, password: string, referredBy?: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateBalance: (amount: number) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const updatedUser = {
            ...userData,
            email: firebaseUser.email || undefined
          };
          setUser(updatedUser);
        } else {
          logoutUser();
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (username: string, password: string, referredBy?: string) => {
    try {
      setIsLoading(true);
      const referralCode = username.substring(0, 4).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
      const email = `${username}@indianotp.in`;
      const { user: firebaseUser, error } = await registerWithEmailAndPassword(email, password);
      if (error) {
        throw new Error(error);
      }
      const userData = {
        username,
        password,
        referralCode,
        referredBy: referredBy || null,
        email
      };
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const newUser = await response.json();
      const userWithEmail = {
        ...newUser,
        email: firebaseUser?.email
      };
      setUser(userWithEmail);
      localStorage.setItem('user', JSON.stringify(userWithEmail));
      toast({
        title: 'Registration successful',
        description: `Welcome, ${newUser.username}!`,
      });
      navigate('/home');
    } catch (error) {
      await logoutUser();
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const email = `${username}@indianotp.in`;
      const { user: firebaseUser, error } = await loginWithEmailAndPassword(email, password);
      if (error) {
        throw new Error(error);
      }
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const userData = await response.json();
      const userWithEmail = {
        ...userData,
        email: firebaseUser?.email
      };
      setUser(userWithEmail);
      localStorage.setItem('user', JSON.stringify(userWithEmail));
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.username}!`,
      });
      navigate('/home');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem('user');
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const updateBalance = (amount: number) => {
    if (user) {
      const updatedUser = { ...user, balance: user.balance + amount };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, register, login, logout, updateBalance }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

import { onAuthStateChanged, auth } from 'firebase/auth';