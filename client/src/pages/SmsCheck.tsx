import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateOTP, copyToClipboard } from '@/lib/utils';
import { Copy, Clipboard, MessageSquare } from 'lucide-react';

const SmsCheck: React.FC = () => {
  const { toast } = useToast();
  const [template, setTemplate] = useState<string>('default');
  const [otp, setOtp] = useState<string>('123456'); // Default OTP for display
  const [customTemplate, setCustomTemplate] = useState<string>('');
  const [previewText, setPreviewText] = useState<string>('');
  
  const templates = {
    default: 'Dear user, your OTP is {{OTP}}. Please do not share it with anyone.',
    banking: 'Your bank verification OTP is {{OTP}}. Valid for 5 mins. DO NOT share with anyone.',
    shopping: 'Your OTP for purchase verification is {{OTP}}. Valid for 10 mins.',
    login: 'Use {{OTP}} to login to your account. DO NOT share this OTP with anyone.',
    custom: ''
  };
  
  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    if (value !== 'custom') {
      const templateText = templates[value as keyof typeof templates].replace('{{OTP}}', otp);
      setPreviewText(templateText);
    } else {
      setPreviewText(customTemplate.replace('{{OTP}}', otp));
    }
  };
  
  const handleCustomTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomTemplate(e.target.value);
    if (template === 'custom') {
      setPreviewText(e.target.value.replace('{{OTP}}', otp));
    }
  };
  
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and limit to 6 digits
    const newOtp = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(newOtp);
    
    // Update preview
    if (template === 'custom') {
      setPreviewText(customTemplate.replace('{{OTP}}', newOtp));
    } else {
      setPreviewText(templates[template as keyof typeof templates].replace('{{OTP}}', newOtp));
    }
  };
  
  const generateRandomOtp = () => {
    const newOtp = generateOTP();
    setOtp(newOtp);
    
    // Update preview
    if (template === 'custom') {
      setPreviewText(customTemplate.replace('{{OTP}}', newOtp));
    } else {
      setPreviewText(templates[template as keyof typeof templates].replace('{{OTP}}', newOtp));
    }
  };
  
  const copyTextToClipboard = () => {
    if (previewText) {
      copyToClipboard(previewText)
        .then(() => {
          toast({ title: 'Text Copied', description: 'SMS text copied to clipboard' });
        })
        .catch(() => {
          toast({ 
            title: 'Copy Failed', 
            description: 'Failed to copy text',
            variant: 'destructive'
          });
        });
    }
  };
  
  // Initialize preview text on first render
  React.useEffect(() => {
    setPreviewText(templates.default.replace('{{OTP}}', otp));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBackButton={true} />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-8 text-center dark:text-white">SMS Check</h1>
          
          <div className="grid gap-8 max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>SMS Template Preview</CardTitle>
                <CardDescription>
                  Create and preview SMS templates with OTP placeholders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="template">Choose a template</Label>
                  <Select value={template} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Template</SelectItem>
                      <SelectItem value="banking">Banking Template</SelectItem>
                      <SelectItem value="shopping">Shopping Template</SelectItem>
                      <SelectItem value="login">Login Template</SelectItem>
                      <SelectItem value="custom">Custom Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {template === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-template">Custom Template</Label>
                    <Textarea 
                      id="custom-template"
                      placeholder="Enter your template text using {{OTP}} as a placeholder"
                      value={customTemplate}
                      onChange={handleCustomTemplateChange}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Use {{OTP}} as a placeholder for the OTP value.
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP Value</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="otp"
                      value={otp}
                      onChange={handleOtpChange}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="font-mono"
                    />
                    <Button variant="outline" onClick={generateRandomOtp}>
                      Generate
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Label>Preview</Label>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 relative min-h-24">
                    <MessageSquare className="text-gray-300 dark:text-gray-700 absolute top-3 left-3 h-5 w-5" />
                    <div className="pl-7 text-gray-800 dark:text-gray-200">
                      {previewText}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={copyTextToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-center pt-2">
                  <Button 
                    variant="default"
                    onClick={copyTextToClipboard}
                    className="w-full sm:w-auto"
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Copy SMS Text
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>About SMS Check</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  This tool helps you test how your OTPs would look in different SMS message templates. 
                  It's useful for visualizing how your verification messages will appear to users.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Note: This is a simulation tool for preview purposes only. No actual SMS messages are sent.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SmsCheck;
