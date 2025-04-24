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

  // Check if user is logged in and verify auth status with server
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // First check if we have a user in localStorage
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Verify user with the server
          try {
            // Call the /api/user endpoint with the user's ID to verify authentication
            const headers: Record<string, string> = { 
              "x-user-id": userData.id.toString() 
            };
            
            const response = await fetch('/api/user', { 
              method: 'GET',
              headers,
              credentials: 'include'
            });
            
            if (response.ok) {
              // User is authenticated with server
              const serverUserData = await response.json();
              
              // Check if Firebase is also authenticated
              const firebaseUser = auth.currentUser;
              
              // Update the user data with the server data and email from Firebase
              const updatedUser = {
                ...serverUserData,
                email: firebaseUser?.email || userData.email,
                isAdmin: userData.isAdmin // Preserve admin status
              };
              
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
              // Server authentication failed, check firebase
              const firebaseUser = auth.currentUser;
              if (firebaseUser) {
                // Firebase auth exists but server session expired
                // Try to log in again silently
                const username = userData.username;
                const email = `${username}@indianotp.in`;
                
                // Special handling for admin user
                if (userData.isAdmin) {
                  try {
                    // Make a new login request to refresh auth
                    const response = await apiRequest('POST', '/api/auth/login', { 
                      username: "indianotp.in", 
                      password: "Achara" 
                    });
                    
                    if (response.ok) {
                      const refreshedUserData = await response.json();
                      const updatedUser = {
                        ...refreshedUserData,
                        email: firebaseUser.email,
                        isAdmin: true
                      };
                      
                      setUser(updatedUser);
                      localStorage.setItem('user', JSON.stringify(updatedUser));
                    } else {
                      throw new Error("Failed to refresh admin session");
                    }
                  } catch (error) {
                    console.error("Error refreshing admin session:", error);
                    await logoutUser();
                    setUser(null);
                    localStorage.removeItem('user');
                  }
                } else {
                  // For regular users, just clear the auth state for now
                  // They will need to log in again
                  await logoutUser();
                  setUser(null);
                  localStorage.removeItem('user');
                }
              } else {
                // No Firebase user either, clear everything
                setUser(null);
                localStorage.removeItem('user');
              }
            }
          } catch (error) {
            console.error("Error verifying authentication:", error);
            // Don't clear user on network errors to allow offline functionality
          }
        } else {
          // Check Firebase auth state
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            // Firebase user exists but no local user data
            // This is an inconsistent state - log out from Firebase
            await logoutUser();
          }
          
          setUser(null);
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
      
      // First authenticate with Firebase (using email as username with @indianotp.in domain)
      const email = `${username}@indianotp.in`;
      const { user: firebaseUser, error } = await loginWithEmailAndPassword(email, password);
      
      if (error) {
        throw new Error(error);
      }
      
      // Then fetch user data from our API
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const userData = await response.json();
      
      // Check if this is the admin account
      const isAdmin = username === "indianotp.in" && password === "Achara";
      
      // Combine Firebase and API data
      const userWithEmail = {
        ...userData,
        email: firebaseUser?.email,
        isAdmin: isAdmin
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
