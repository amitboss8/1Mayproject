import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { copyToClipboard } from '@/lib/utils';

const GetOTP: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [otp, setOtp] = useState<string | null>(null);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/otp/generate', {});
      return res.json();
    },
    onSuccess: (data) => {
      setOtp(data.otp);
      updateBalance(-data.cost);
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/otp/history'] });
      
      toast({
        title: 'OTP Generated',
        description: `₹${data.cost} has been deducted from your wallet.`
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to generate OTP',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });

  const handleGenerateOtp = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to generate OTP',
        variant: 'destructive'
      });
      return;
    }
    
    if (user.balance < 1) {
      toast({
        title: 'Insufficient Balance',
        description: 'Please add funds to your wallet',
        variant: 'destructive'
      });
      return;
    }
    
    generateOtpMutation.mutate();
  };

  const handleCopyOtp = () => {
    if (otp) {
      copyToClipboard(otp)
        .then(() => {
          setShowCopiedToast(true);
          setTimeout(() => setShowCopiedToast(false), 2000);
        })
        .catch(() => {
          toast({
            title: 'Copy Failed',
            description: 'Failed to copy OTP',
            variant: 'destructive'
          });
        });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBalance={true} showBackButton={true} />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-8 text-center dark:text-white">Generate OTP</h1>
          
          {/* Mobile wallet balance */}
          <div className="md:hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Wallet Balance</span>
              <span className="font-semibold dark:text-white">₹{user?.balance || 0}</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md mx-auto">
            <div className="mb-8 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-2">Cost per OTP</p>
              <p className="text-xl font-semibold text-[#138808] dark:text-green-400">₹1</p>
            </div>
            
            {otp && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-md mb-6 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">Your OTP</p>
                <div className="flex justify-center space-x-2 mb-4">
                  {otp.split('').map((digit, index) => (
                    <div 
                      key={index}
                      className="w-10 h-12 bg-white dark:bg-gray-800 border border-[#0066CC] dark:border-blue-500 rounded-md flex items-center justify-center text-xl font-bold dark:text-white"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="flex items-center justify-center space-x-2 w-full"
                  onClick={handleCopyOtp}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  <span>Copy OTP</span>
                </Button>
              </div>
            )}
            
            <Button
              className="w-full bg-[#FF9933] hover:bg-opacity-90 text-white font-medium py-3 rounded-md transition-all shadow-sm"
              onClick={handleGenerateOtp}
              disabled={generateOtpMutation.isPending}
            >
              {generateOtpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Get OTP'}
            </Button>
            
            <p className="text-sm text-red-600 dark:text-red-400 mt-4 italic text-center">
              If you received OTP once then we can't approve refunds.
            </p>
          </div>
        </div>
      </main>
      
      {/* OTP Copied Toast */}
      <div className={`fixed bottom-4 right-4 transition-all duration-300 transform ${showCopiedToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <Alert variant="default" className="bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="text-green-500 dark:text-green-400">
              <Copy className="h-4 w-4" />
            </div>
            <AlertTitle>OTP Copied!</AlertTitle>
          </div>
          <AlertDescription className="text-sm text-gray-600 dark:text-gray-400">
            The OTP has been copied to your clipboard.
          </AlertDescription>
        </Alert>
      </div>
      
      <Footer />
    </div>
  );
};

export default GetOTP;
