import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/context/UserContext';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDate, copyToClipboard } from '@/lib/utils';
import { Loader2, Copy, X, CheckIcon, AlertCircle, History, Plus, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';

// Import QR code
import paymentQRImage from '@/assets/payment-qr.jpg';

// Define types
type Transaction = {
  id: number;
  userId: number;
  amount: number;
  type: string;
  note: string;
  timestamp: string;
};

type BalanceRequest = {
  id: number;
  userId: number;
  amount: number;
  utrNumber: string;
  status: string;
  timestamp: string;
  approvedBy: number | null;
  approvedAt: string | null;
};

const Wallet: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const { toast } = useToast();
  const [addAmount, setAddAmount] = useState(100); // Default amount
  const [utrNumber, setUtrNumber] = useState('');
  const [activeTab, setActiveTab] = useState<string>('payment');

  // Fetch transactions
  const { data: transactions = [], isLoading, refetch } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions'],
    enabled: !!user,
  });
  
  // Fetch balance requests
  const { data: balanceRequests = [], isLoading: isLoadingRequests, refetch: refetchRequests } = useQuery<BalanceRequest[]>({
    queryKey: ['/api/wallet/balance-requests'],
    enabled: !!user,
  });

  // Add balance request mutation
  const addBalanceRequestMutation = useMutation({
    mutationFn: async (data: { amount: number, utrNumber: string }) => {
      const res = await apiRequest('POST', '/api/wallet/balance-request', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: 'Balance Request Submitted', 
        description: `Your request for ₹${data.amount} has been submitted for approval.`
      });
      refetchRequests();
      setIsAddBalanceModalOpen(false);
      setUtrNumber('');
    },
    onError: (error) => {
      toast({ 
        title: 'Request Failed', 
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });

  // Legacy add balance mutation - not used with the new flow
  const addBalanceMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest('POST', '/api/wallet/add', { amount });
      return res.json();
    },
    onSuccess: (data) => {
      updateBalance(data.transaction.amount);
      toast({ title: 'Balance Added', description: `₹${data.transaction.amount} has been added to your wallet` });
      refetch();
      setIsAddBalanceModalOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to add balance', 
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });

  const handleSubmitBalanceRequest = () => {
    if (!user) {
      toast({ 
        title: 'Authentication Required', 
        description: 'Please login to add balance',
        variant: 'destructive'
      });
      return;
    }
    
    if (!utrNumber.trim()) {
      toast({ 
        title: 'UTR Number Required', 
        description: 'Please enter the UTR number from your payment',
        variant: 'destructive'
      });
      return;
    }
    
    addBalanceRequestMutation.mutate({ amount: addAmount, utrNumber });
  };

  // Legacy function - not used with new flow
  const handleAddBalance = () => {
    if (user) {
      addBalanceMutation.mutate(addAmount);
    } else {
      toast({ 
        title: 'Authentication Required', 
        description: 'Please login to add balance',
        variant: 'destructive'
      });
    }
  };

  const [upiCopied, setUpiCopied] = useState(false);
  const upiId = "Amitachara@fam";

  const handleCopyUpi = () => {
    copyToClipboard(upiId)
      .then(() => {
        setUpiCopied(true);
        setTimeout(() => setUpiCopied(false), 2000);
        toast({ title: 'UPI ID Copied', description: 'UPI ID copied to clipboard' });
      })
      .catch(() => {
        toast({ 
          title: 'Copy Failed', 
          description: 'Failed to copy UPI ID',
          variant: 'destructive'
        });
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBalance={true} showBackButton={true} />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-8 text-center dark:text-white">My Wallet</h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col items-center mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-2">Current Balance</p>
              <p className="text-3xl font-bold text-[#138808] dark:text-green-400">₹{user?.balance || 0}</p>
            </div>
            <Button
              className="w-full bg-[#FF9933] hover:bg-opacity-90 text-white font-medium py-3 rounded-md transition-all shadow-sm"
              onClick={() => setIsAddBalanceModalOpen(true)}
              disabled={addBalanceMutation.isPending}
            >
              {addBalanceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : 'Add Balance'}
            </Button>
          </div>
          
          {/* Pending Balance Requests Section */}
          {balanceRequests && balanceRequests.filter(req => req.status === 'pending').length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Pending Balance Requests</h2>
              <div className="overflow-x-auto">
                {isLoadingRequests ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0066CC]" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {balanceRequests.filter(req => req.status === 'pending').map((request) => (
                      <div key={request.id} className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-900 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium dark:text-white">₹{request.amount}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              UTR: {request.utrNumber}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {formatDate(new Date(request.timestamp))}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800">
                            Pending
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-4 italic">
                Your balance request will be processed by admin shortly.
              </p>
            </div>
          )}
          
          {/* Transaction History Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Transaction History</h2>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0066CC]" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase">
                    <tr>
                      <th scope="col" className="px-4 py-3">Date</th>
                      <th scope="col" className="px-4 py-3">Amount</th>
                      <th scope="col" className="px-4 py-3">Type</th>
                      <th scope="col" className="px-4 py-3">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction: Transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 dark:text-gray-300">{formatDate(new Date(transaction.timestamp))}</td>
                        <td className="px-4 py-3 font-medium dark:text-white">₹{Math.abs(transaction.amount)}</td>
                        <td className="px-4 py-3">
                          {transaction.type === 'add' ? (
                            <span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 py-1 px-2 rounded-full text-xs">
                              Add
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 py-1 px-2 rounded-full text-xs">
                              Deduct
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{transaction.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No transactions found
                </div>
              )}
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-4 italic">Please check amount before payment.</p>
          </div>
        </div>
      </main>
      
      {/* Add Balance Modal */}
      <Dialog open={isAddBalanceModalOpen} onOpenChange={setIsAddBalanceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Balance</DialogTitle>
            <DialogDescription>
              Make a payment and submit the UTR number to add balance to your wallet.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payment">
                <div className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Payment
                </div>
              </TabsTrigger>
              <TabsTrigger value="utr">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Submit UTR
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="payment" className="mt-4">
              <div className="flex justify-center my-4">
                <div className="bg-white p-2 rounded-lg mb-2 max-w-[200px] mx-auto">
                  <img 
                    src={paymentQRImage}
                    alt="UPI Payment QR Code" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{upiId}</span>
                <Button variant="ghost" size="icon" onClick={handleCopyUpi}>
                  {upiCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex flex-col space-y-2 mt-4">
                <p className="text-sm">Select amount to add:</p>
                <div className="flex flex-wrap gap-2">
                  {[50, 100, 200, 500].map(amount => (
                    <Button
                      key={amount}
                      variant={addAmount === amount ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAddAmount(amount)}
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  After making payment, go to "Submit UTR" tab to submit your UTR number.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end mt-4">
                <Button onClick={() => setActiveTab('utr')}>
                  Next: Submit UTR
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="utr" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="utr-number">Enter UTR Number</Label>
                  <Input 
                    id="utr-number" 
                    placeholder="e.g. 123456789012" 
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    UTR (Unique Transaction Reference) number is provided by your bank after the payment is complete.
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Amount to be added:</p>
                  <p className="text-xl font-bold">₹{addAmount}</p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={handleSubmitBalanceRequest}
                    disabled={addBalanceRequestMutation.isPending}
                    className="w-full"
                  >
                    {addBalanceRequestMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : 'Submit Request'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('payment')}
                    className="w-full"
                  >
                    Back to Payment
                  </Button>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Balance Request Process</AlertTitle>
                  <AlertDescription>
                    Your balance request will be reviewed by admin and approved once payment is verified.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Wallet;
