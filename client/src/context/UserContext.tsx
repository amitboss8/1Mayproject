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

  // Check if user is logged in with server session
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Verify user with the server session
        try {
          const response = await fetch('/api/user', { 
            method: 'GET',
            credentials: 'include'
          });
          
          if (response.ok) {
            // User is authenticated with server
            const userData = await response.json();
            
            // Check if this is the admin account
            const isAdmin = userData.username === "indianotp.in";
            const userWithAdmin = {
              ...userData,
              isAdmin
            };
            
            setUser(userWithAdmin);
            localStorage.setItem('user', JSON.stringify(userWithAdmin));
          } else {
            // Server authentication failed
            setUser(null);
            localStorage.removeItem('user');
            
            // Check if Firebase is still logged in, if so log out
            const firebaseUser = auth.currentUser;
            if (firebaseUser) {
              await logoutUser();
            }
          }
        } catch (error) {
          console.error("Error verifying authentication:", error);
          // Session verification failed - clear user
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Run the auth check
    checkAuth();
    
    // Also listen for Firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        // If Firebase logs out, make sure we clear local state too
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // First try to authenticate with our server session API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const userData = await response.json();
      
      // Now try Firebase authentication
      try {
        // Firebase email uses username@indianotp.in format
        const email = `${username}@indianotp.in`;
        await loginWithEmailAndPassword(email, password);
      } catch (firebaseError) {
        console.warn('Firebase login error:', firebaseError);
        // Continue even if Firebase login fails, since we have server session
      }
      
      // Check if this is the admin account
      const isAdmin = username === "indianotp.in" && password === "Achara";
      
      // Update user data with admin status
      const userWithAdmin = {
        ...userData,
        isAdmin
      };
      
      setUser(userWithAdmin);
      localStorage.setItem('user', JSON.stringify(userWithAdmin));
      
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
      
      // Try to register with Firebase first
      try {
        const email = `${username}@indianotp.in`;
        await registerWithEmailAndPassword(email, password);
      } catch (firebaseError) {
        console.warn('Firebase registration error:', firebaseError);
        // Continue even if Firebase registration fails, since we have server session
      }
      
      // Register with our server API
      const userData = {
        username,
        password,
        referralCode,
        referredBy: referredBy || null
      };
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const newUser = await response.json();
      
      // Add admin status (should always be false for new users)
      const userWithEmail = {
        ...newUser,
        isAdmin: false
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
      try {
        await logoutUser();
      } catch (e) {
        console.error('Error logging out after registration failure:', e);
      }
      
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
      // Log out from server session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Log out from Firebase
      await logoutUser();
      
      // Clear local state
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
