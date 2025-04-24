import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard, formatDate } from '@/lib/utils';
import { Loader2, Copy, Users, Gift } from 'lucide-react';

// Define referral type
type Referral = {
  id: number;
  referrerId: number;
  referredId: number;
  timestamp: string;
  credited: boolean;
};

const Refer: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  
  // Fetch referrals
  const { data: referrals, isLoading } = useQuery({
    queryKey: ['/api/referrals'],
    enabled: !!user,
  });
  
  const handleCopyReferralCode = () => {
    if (user?.referralCode) {
      copyToClipboard(user.referralCode)
        .then(() => {
          toast({ title: 'Referral Code Copied', description: 'Referral code copied to clipboard' });
        })
        .catch(() => {
          toast({ 
            title: 'Copy Failed', 
            description: 'Failed to copy referral code',
            variant: 'destructive'
          });
        });
    }
  };
  
  const handleCopyReferralLink = () => {
    const referralLink = `${window.location.origin}/?ref=${user?.referralCode}`;
    
    copyToClipboard(referralLink)
      .then(() => {
        toast({ title: 'Referral Link Copied', description: 'Referral link copied to clipboard' });
      })
      .catch(() => {
        toast({ 
          title: 'Copy Failed', 
          description: 'Failed to copy referral link',
          variant: 'destructive'
        });
      });
  };
  
  // Calculate total earned from referrals
  const totalReferralEarnings = referrals?.reduce((total: number, referral: Referral) => {
    return total + (referral.credited ? 10 : 0); // Assuming each referral earns ₹10
  }, 0) || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBackButton={true} />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-8 text-center dark:text-white">Refer & Earn</h1>
          
          <div className="grid gap-8 max-w-3xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Your Referral Program</CardTitle>
                <CardDescription>
                  Share your referral code and earn ₹10 for each new user who joins!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Your Referral Code</p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="text-2xl font-bold tracking-wider dark:text-white">
                        {user?.referralCode || 'LOADING'}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleCopyReferralCode}
                        disabled={!user?.referralCode}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="mb-2 text-sm text-center">Share your referral link</p>
                    <div className="flex space-x-2">
                      <Input 
                        readOnly 
                        value={user ? `${window.location.origin}/?ref=${user.referralCode}` : 'Loading...'}
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                      <Button variant="outline" onClick={handleCopyReferralLink} disabled={!user}>
                        <Copy className="h-4 w-4 mr-2" />
                        <span>Copy</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex items-center space-x-3">
                      <Users className="h-10 w-10 text-[#FF9933]" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Total Referrals</p>
                        <p className="text-xl font-bold dark:text-white">{referrals?.length || 0}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex items-center space-x-3">
                      <Gift className="h-10 w-10 text-[#138808]" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Total Earned</p>
                        <p className="text-xl font-bold dark:text-white">₹{totalReferralEarnings}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-4 dark:text-white">How it works</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      <li>Share your referral code or link with friends</li>
                      <li>When they sign up using your code, they get ₹5 bonus</li>
                      <li>You get ₹10 for each successful referral</li>
                      <li>The more people you refer, the more you earn!</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Referral History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0066CC]" />
                  </div>
                ) : referrals && referrals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase">
                        <tr>
                          <th scope="col" className="px-4 py-3">Date</th>
                          <th scope="col" className="px-4 py-3">User ID</th>
                          <th scope="col" className="px-4 py-3">Status</th>
                          <th scope="col" className="px-4 py-3">Reward</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {referrals.map((referral: Referral) => (
                          <tr key={referral.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 dark:text-gray-300">{formatDate(new Date(referral.timestamp))}</td>
                            <td className="px-4 py-3 dark:text-gray-300">#{referral.referredId}</td>
                            <td className="px-4 py-3">
                              {referral.credited ? (
                                <span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 py-1 px-2 rounded-full text-xs">
                                  Credited
                                </span>
                              ) : (
                                <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 py-1 px-2 rounded-full text-xs">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-[#138808] dark:text-green-400 font-medium">
                              {referral.credited ? '₹10' : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                    <p>No referrals yet</p>
                    <p className="text-sm mt-1">Share your code to start earning rewards!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Refer;
