import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, AlertCircle, Search, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { copyToClipboard } from '@/lib/utils';
import { serviceList, serviceCategories, ServiceOption } from '@/data/serviceList';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const GetOTP: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [otp, setOtp] = useState<string | null>(null);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter services based on selected category and search query
  const filteredServices = serviceList.filter((service) => {
    const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const generateOtpMutation = useMutation({
    mutationFn: async () => {
      // Include the selected service in the API request
      const payload = selectedService 
        ? { serviceId: selectedService.id, serviceName: selectedService.name, price: selectedService.price }
        : {};
      
      const res = await apiRequest('POST', '/api/otp/generate', payload);
      return res.json();
    },
    onSuccess: (data) => {
      setOtp(data.otp);
      // Use the cost from the selected service or fallback to the API response
      const cost = selectedService ? selectedService.price : data.cost;
      updateBalance(-cost);
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/otp/history'] });
      
      toast({
        title: 'OTP Generated',
        description: `₹${cost.toFixed(2)} has been deducted from your wallet.`
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
    
    // If no service is selected, show error
    if (!selectedService) {
      toast({
        title: 'Service Required',
        description: 'Please select a service to generate OTP',
        variant: 'destructive'
      });
      return;
    }
    
    // Check if user has enough balance
    if (user.balance < selectedService.price) {
      toast({
        title: 'Insufficient Balance',
        description: `You need ₹${selectedService.price.toFixed(2)} to generate this OTP. Please add funds to your wallet.`,
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

  const handleServiceSelect = (service: ServiceOption) => {
    setSelectedService(service);
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
              <span className="font-semibold dark:text-white">₹{user?.balance?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md mx-auto mb-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Select Service</h2>
            
            {/* Service Selection UI */}
            <div className="mb-6">
              {/* Search Box */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Category Filter Tabs */}
              <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
                <div className="relative">
                  <TabsList className="w-full h-auto overflow-x-auto flex flex-nowrap pb-2 justify-start">
                    <TabsTrigger value="All" className="flex-shrink-0">All</TabsTrigger>
                    {serviceCategories.slice(0, 5).map((category) => (
                      <TabsTrigger key={category} value={category} className="flex-shrink-0">{category}</TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                {/* More categories in dropdown */}
                <Select onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="More categories..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      {serviceCategories.slice(5).map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Tabs>
              
              {/* Service List */}
              <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                {filteredServices.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredServices.map((service) => (
                      <div
                        key={service.id}
                        className={cn(
                          "flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all",
                          selectedService?.id === service.id && "bg-gray-100 dark:bg-gray-700"
                        )}
                        onClick={() => handleServiceSelect(service)}
                      >
                        <div className="flex items-center space-x-3">
                          {selectedService?.id === service.id && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          <span className="dark:text-white">{service.name}</span>
                        </div>
                        <Badge variant="outline" className="bg-[#FF9933] text-white">₹{service.price.toFixed(2)}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No services found. Try a different search term.
                  </div>
                )}
              </div>
            </div>
            
            {/* Selected Service Summary */}
            {selectedService && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Selected Service:</p>
                  <span className="font-bold dark:text-white">{selectedService.name}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Price:</p>
                  <span className="text-[#138808] dark:text-green-400 font-bold">₹{selectedService.price.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            {/* OTP Display */}
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
            
            {/* Generate Button */}
            <Button
              className="w-full bg-[#FF9933] hover:bg-opacity-90 text-white font-medium py-3 rounded-md transition-all shadow-sm"
              onClick={handleGenerateOtp}
              disabled={generateOtpMutation.isPending || !selectedService}
            >
              {generateOtpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : selectedService ? 
                `Get OTP for ${selectedService.name} (₹${selectedService.price.toFixed(2)})` : 
                'Select a service first'}
            </Button>
            
            <p className="text-sm text-red-600 dark:text-red-400 mt-4 italic text-center">
              If you received OTP once then we can't approve refunds.
            </p>
          </div>
          
          {/* Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-3 dark:text-white">How It Works</h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p>1. Select the service you need an OTP for</p>
              <p>2. Each service has its own price (from ₹1.13 to ₹3.12)</p>
              <p>3. Click "Get OTP" to generate a random 6-digit code</p>
              <p>4. The cost will be deducted from your wallet balance</p>
              <p>5. You can copy the OTP to use wherever needed</p>
            </div>
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
