import React from 'react';
import { Link, useLocation } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  Key,
  Headset,
  Mail,
  FileText,
  Users,
  History,
  MessageSquare
} from 'lucide-react';

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  href: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, href }) => {
  const [, navigate] = useLocation();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };
  
  return (
    <Button
      variant="outline"
      className="feature-item bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all p-6 h-auto flex flex-col items-center"
      onClick={handleClick}
    >
      <div className="text-2xl mb-3">
        {icon}
      </div>
      <span className="font-medium text-center">{title}</span>
    </Button>
  );
};

const Home: React.FC = () => {
  const { user, isLoggedIn } = useUser();
  const [, navigate] = useLocation();
  
  React.useEffect(() => {
    // For demo purposes, we'll let users access the page without login
    // but in a real app, you might want to redirect to login
    // if (!isLoggedIn) {
    //   navigate('/');
    // }
  }, [isLoggedIn, navigate]);

  const features = [
    { 
      icon: <Wallet className="text-[#FF9933]" />, 
      title: 'Wallet', 
      href: '/wallet' 
    },
    { 
      icon: <Key className="text-[#138808]" />, 
      title: 'Get OTP', 
      href: '/get-otp' 
    },
    { 
      icon: <Headset className="text-[#0066CC]" />, 
      title: 'Customer Support', 
      href: '/support' 
    },
    { 
      icon: <Mail className="text-gray-600 dark:text-gray-400" />, 
      title: 'Contact Us', 
      href: '/contact' 
    },
    { 
      icon: <FileText className="text-gray-600 dark:text-gray-400" />, 
      title: 'Terms & Conditions', 
      href: '/terms' 
    },
    { 
      icon: <Users className="text-[#FF9933]" />, 
      title: 'Refer & Earn', 
      href: '/refer' 
    },
    { 
      icon: <History className="text-[#138808]" />, 
      title: 'Number History', 
      href: '/history' 
    },
    { 
      icon: <MessageSquare className="text-[#0066CC]" />, 
      title: 'SMS Check', 
      href: '/sms-check' 
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBalance={true} />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-center mb-8 dark:text-white">Welcome to Indian OTP</h1>
          
          {/* Mobile wallet balance */}
          <div className="md:hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Wallet Balance</span>
              <span className="font-semibold dark:text-white">₹{user?.balance || 0}</span>
            </div>
          </div>
          
          {/* Feature navigation grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <FeatureItem
                key={index}
                icon={feature.icon}
                title={feature.title}
                href={feature.href}
              />
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
