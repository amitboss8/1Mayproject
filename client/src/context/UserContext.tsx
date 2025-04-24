import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { auth, loginWithEmailAndPassword, registerWithEmailAndPassword, logoutUser } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Define types
type UserType = {
  id: number;
  username: string;
  balance: number;
  referralCode: string;
  email?: string;
  isAdmin?: boolean;
};

type UserContextType = {
  user: UserType | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, referredBy?: string) => Promise<void>;
  logout: () => void;
  updateBalance: (amount: number) => void;
};

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook for using the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// User Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Check if user is logged in with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Firebase user exists, check if we have the user in local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Add email from Firebase to the user data
          const updatedUser = {
            ...userData,
            email: firebaseUser.email || undefined
          };
          
          setUser(updatedUser);
        } else {
          // If we don't have user data in local storage but have a Firebase user,
          // we'll log them out for consistency
          logoutUser();
        }
      } else {
        // No Firebase user, clear local user
        setUser(null);
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // First authenticate with Firebase (using email as username with @indianotp.in domain)
      const email = `${username}@indianotp.in`;
      const { user: firebaseUser, error } = await loginWithEmailAndPassword(email, password);
      
      if (error) {
        throw new Error(error);
      }
      
      // Then fetch user data from our API
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const userData = await response.json();
      
      // Combine Firebase and API data
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

  // Register function
  const register = async (username: string, password: string, referredBy?: string) => {
    try {
      setIsLoading(true);
      
      // Create a referral code
      const referralCode = username.substring(0, 4).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // First register with Firebase (using email as username with @indianotp.in domain)
      const email = `${username}@indianotp.in`;
      const { user: firebaseUser, error } = await registerWithEmailAndPassword(email, password);
      
      if (error) {
        throw new Error(error);
      }
      
      // Then register with our API
      const userData = {
        username,
        password,
        referralCode,
        referredBy: referredBy || null,
        email
      };
      
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const newUser = await response.json();
      
      // Combine Firebase and API data
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
      // If there's an error, make sure to clean up Firebase user if it was created
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

  // Logout function
  const logout = async () => {
    try {
      // Log out from Firebase first
      await logoutUser();
      
      // Then clear local state
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

  // Update balance function
  const updateBalance = (amount: number) => {
    if (user) {
      const updatedUser = { ...user, balance: user.balance + amount };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        updateBalance,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
