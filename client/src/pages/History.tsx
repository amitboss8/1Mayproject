import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDate, copyToClipboard } from '@/lib/utils';
import { Loader2, Trash, Copy, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define OTP history type
type OtpHistory = {
  id: number;
  userId: number;
  otp: string;
  timestamp: string;
};

const History: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  
  // Fetch OTP history
  const { data: otpHistory, isLoading } = useQuery({
    queryKey: ['/api/otp/history'],
    enabled: !!user,
  });
  
  // Clear OTP history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/api/otp/history', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/otp/history'] });
      toast({ title: 'History Cleared', description: 'Your OTP history has been cleared' });
      setIsConfirmDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to clear history',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });
  
  const handleClearHistory = () => {
    setIsConfirmDialogOpen(true);
  };
  
  const confirmClearHistory = () => {
    clearHistoryMutation.mutate();
  };
  
  const handleCopyOtp = (otp: string) => {
    copyToClipboard(otp)
      .then(() => {
        toast({ title: 'OTP Copied', description: 'OTP copied to clipboard' });
      })
      .catch(() => {
        toast({ 
          title: 'Copy Failed', 
          description: 'Failed to copy OTP',
          variant: 'destructive'
        });
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBackButton={true} />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold dark:text-white">Number History</h1>
            {otpHistory && otpHistory.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleClearHistory}
                disabled={clearHistoryMutation.isPending}
              >
                {clearHistoryMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash className="h-4 w-4 mr-2" />
                )}
                Clear History
              </Button>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Your OTP History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0066CC]" />
                </div>
              ) : otpHistory && otpHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase">
                      <tr>
                        <th scope="col" className="px-4 py-3">Date & Time</th>
                        <th scope="col" className="px-4 py-3">OTP</th>
                        <th scope="col" className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {otpHistory.map((history: OtpHistory) => (
                        <tr key={history.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 dark:text-gray-300">{formatDate(new Date(history.timestamp))}</td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              {history.otp.split('').map((digit, index) => (
                                <div 
                                  key={index}
                                  className="w-8 h-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md flex items-center justify-center font-mono font-bold dark:text-white"
                                >
                                  {digit}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopyOtp(history.otp)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg mb-2">No OTP history found</p>
                  <p className="text-sm">Generate OTPs to see them here.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Alert variant="default" className="mt-6 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800/30">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              For security reasons, we recommend clearing your OTP history regularly.
            </AlertDescription>
          </Alert>
        </div>
      </main>
      
      {/* Confirm Clear History Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear OTP History</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear your OTP history? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button 
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmClearHistory}
              disabled={clearHistoryMutation.isPending}
            >
              {clearHistoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : 'Clear History'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default History;
