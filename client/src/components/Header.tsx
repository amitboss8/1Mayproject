import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import ThemeToggle from '@/components/ThemeToggle';
import { Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface HeaderProps {
  showBalance?: boolean;
  showNav?: boolean;
  showBackButton?: boolean;
  backTo?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  showBalance = false, 
  showNav = false,
  showBackButton = false,
  backTo = '/home'
}) => {
  const { user, isLoggedIn, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const goBack = () => {
    navigate(backTo);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Left section with logo */}
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={goBack}
              className="text-gray-600 hover:text-[#0066CC] dark:text-gray-400 dark:hover:text-gray-200 transition-all"
            >
              <i className="fas fa-arrow-left"></i>
            </Button>
          )}
          
          <Link href={isLoggedIn ? '/home' : '/'} className="flex items-center space-x-2">
            <span className="text-[#FF9933] font-bold text-xl sm:text-2xl">Indian</span>
            <span className="text-[#138808] font-bold text-xl sm:text-2xl">OTP</span>
          </Link>
        </div>

        {/* Center/Right section with navigation or actions */}
        <div className="flex items-center space-x-4">
          {showBalance && isLoggedIn && user && (
            <span className="hidden md:inline-block bg-gray-100 dark:bg-gray-800 py-1 px-3 rounded-full text-sm font-medium">
              Balance: ₹{user.balance}
            </span>
          )}
          
          {showNav && (
            <nav className="hidden md:flex space-x-6">
              <Link href="#about" className="text-gray-600 hover:text-[#0066CC] dark:text-gray-400 dark:hover:text-gray-200 transition-all">About</Link>
              <Link href="#features" className="text-gray-600 hover:text-[#0066CC] dark:text-gray-400 dark:hover:text-gray-200 transition-all">Features</Link>
              <Link href="#support" className="text-gray-600 hover:text-[#0066CC] dark:text-gray-400 dark:hover:text-gray-200 transition-all">Support</Link>
            </nav>
          )}
          
          <ThemeToggle />
          
          {/* Auth Buttons */}
          {!isLoggedIn ? (
            <div className="hidden md:flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/login')}
                className="text-[#0066CC] border-[#0066CC] hover:bg-[#0066CC] hover:text-white"
              >
                Login
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate('/signup')}
                className="bg-[#FF9933] hover:bg-opacity-90 text-white"
              >
                Sign Up
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              {user?.isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950"
                >
                  <span className="mr-1">Admin Panel</span>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
              >
                <span className="mr-2">Logout</span>
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          )}
          
          {(showNav || !isLoggedIn) && (
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden text-gray-600 dark:text-gray-400 focus:outline-none"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {(showNav || !isLoggedIn) && isMenuOpen && (
        <div className={cn(
          "md:hidden bg-white dark:bg-gray-900 pb-4 px-4 transition-all overflow-hidden",
          isMenuOpen ? "max-h-60" : "max-h-0"
        )}>
          <div className="flex flex-col space-y-3">
            {showNav && (
              <>
                <Link href="#about" className="text-gray-600 dark:text-gray-400 py-2 hover:text-[#0066CC] dark:hover:text-gray-200 transition-all">About</Link>
                <Link href="#features" className="text-gray-600 dark:text-gray-400 py-2 hover:text-[#0066CC] dark:hover:text-gray-200 transition-all">Features</Link>
                <Link href="#support" className="text-gray-600 dark:text-gray-400 py-2 hover:text-[#0066CC] dark:hover:text-gray-200 transition-all">Support</Link>
              </>
            )}
            
            {!isLoggedIn ? (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1"></div>
                <Button 
                  variant="outline" 
                  className="w-full justify-center py-2 text-[#0066CC] border-[#0066CC] hover:bg-[#0066CC] hover:text-white"
                  onClick={() => {
                    navigate('/login');
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button 
                  className="w-full justify-center py-2 bg-[#FF9933] hover:bg-opacity-90 text-white"
                  onClick={() => {
                    navigate('/signup');
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-1"></div>
                {user?.isAdmin && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-center py-2 mb-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950"
                    onClick={() => {
                      navigate('/admin');
                      setIsMenuOpen(false);
                    }}
                  >
                    <span>Admin Panel</span>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full justify-center py-2 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="mr-2">Logout</span>
                  <i className="fas fa-sign-out-alt"></i>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
