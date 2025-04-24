import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useUser } from '@/context/UserContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Loader2, CheckIcon, X, AlertCircle, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define types
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

type User = {
  id: number;
  username: string;
  balance: number;
};

const AdminPanel: React.FC = () => {
  const { user } = useUser();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  
  // Redirect if not admin
  React.useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/home');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the admin panel.',
        variant: 'destructive'
      });
    } else if (!user) {
      navigate('/auth');
      toast({
        title: 'Authentication Required',
        description: 'Please login to access the admin panel.',
        variant: 'destructive'
      });
    }
  }, [user, navigate, toast]);

  // Fetch all balance requests
  const { data: balanceRequests = [], isLoading, refetch } = useQuery<BalanceRequest[]>({
    queryKey: ['/api/admin/balance-requests'],
    enabled: !!(user && user.isAdmin),
  });

  // Approve balance request mutation
  const approveRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const res = await apiRequest('POST', `/api/admin/balance-requests/${requestId}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Request Approved',
        description: 'The balance request has been approved and user balance has been updated.',
      });
      refetch();
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to approve request', 
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });

  // Reject balance request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const res = await apiRequest('POST', `/api/admin/balance-requests/${requestId}/reject`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Request Rejected',
        description: 'The balance request has been rejected.',
      });
      refetch();
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to reject request', 
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  });

  // Handle approve request
  const handleApproveRequest = (requestId: number) => {
    approveRequestMutation.mutate(requestId);
  };

  // Handle reject request
  const handleRejectRequest = (requestId: number) => {
    rejectRequestMutation.mutate(requestId);
  };

  const isPending = approveRequestMutation.isPending || rejectRequestMutation.isPending;

  // Filter requests based on active tab
  const filteredRequests = React.useMemo(() => {
    if (!balanceRequests) return [];
    
    switch (activeTab) {
      case 'pending':
        return balanceRequests.filter(req => req.status === 'pending');
      case 'approved':
        return balanceRequests.filter(req => req.status === 'approved');
      case 'rejected':
        return balanceRequests.filter(req => req.status === 'rejected');
      default:
        return balanceRequests;
    }
  }, [balanceRequests, activeTab]);

  if (!user || !user.isAdmin) {
    return null; // Don't render anything if not an admin
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showNav={true} showBackButton={true} backTo="/home" />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold dark:text-white">Admin Panel</h1>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <ClipboardList className="h-5 w-5 mr-2 text-[#FF9933]" />
              <h2 className="text-xl font-semibold dark:text-white">Balance Requests</h2>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {balanceRequests.filter(req => req.status === 'pending').length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {balanceRequests.filter(req => req.status === 'pending').length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0066CC]" />
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No pending requests found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <div key={request.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between flex-wrap md:flex-nowrap gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <p className="text-xl font-bold dark:text-white">₹{request.amount}</p>
                              <Badge className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                Pending
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              UTR: <span className="font-medium">{request.utrNumber}</span>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              User ID: {request.userId}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Requested on: {formatDate(new Date(request.timestamp))}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 self-center">
                            <Button
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={isPending}
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              {approveRequestMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckIcon className="h-4 w-4 mr-1" /> Approve
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={isPending}
                              variant="destructive"
                              size="sm"
                            >
                              {rejectRequestMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="h-4 w-4 mr-1" /> Reject
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="approved" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0066CC]" />
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No approved requests found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <div key={request.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <p className="text-xl font-bold dark:text-white">₹{request.amount}</p>
                              <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Approved
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              UTR: <span className="font-medium">{request.utrNumber}</span>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              User ID: {request.userId}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Requested on: {formatDate(new Date(request.timestamp))}
                            </p>
                            {request.approvedAt && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Approved on: {formatDate(new Date(request.approvedAt))}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="rejected" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0066CC]" />
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No rejected requests found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <div key={request.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <p className="text-xl font-bold dark:text-white">₹{request.amount}</p>
                              <Badge className="ml-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" variant="outline">
                                Rejected
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              UTR: <span className="font-medium">{request.utrNumber}</span>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              User ID: {request.userId}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Requested on: {formatDate(new Date(request.timestamp))}
                            </p>
                            {request.approvedAt && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Rejected on: {formatDate(new Date(request.approvedAt))}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;