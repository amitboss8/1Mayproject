import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

const CustomerSupport: React.FC = () => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast({
      title: 'Message Sent',
      description: 'We will get back to you within 24 hours.',
    });
    form.reset();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBackButton={true} />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-8 text-center dark:text-white">Customer Support</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about our services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How does OTP generation work?</AccordionTrigger>
                    <AccordionContent>
                      Our service generates random 6-digit OTPs which you can use for testing and verification purposes. Each OTP costs ₹1 from your wallet balance.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I add money to my wallet?</AccordionTrigger>
                    <AccordionContent>
                      Go to the Wallet page and click on "Add Balance". You can then scan the QR code or use the UPI ID to make a payment. The amount will be reflected in your wallet once the payment is verified.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Can I get a refund for OTPs?</AccordionTrigger>
                    <AccordionContent>
                      No, we cannot provide refunds for OTPs once they are generated. Please make sure you need an OTP before generating it.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How does the referral system work?</AccordionTrigger>
                    <AccordionContent>
                      When you refer someone to our service using your referral code, both you and the referred person receive bonus credits in your wallet once they register.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Is my data safe?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we don't store your OTPs or personal information. We only maintain transaction records for your wallet balance.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  We usually respond within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="How can we help you?" 
                              rows={5}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">Submit</Button>
                  </form>
                </Form>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Alternative contact methods:
                  </p>
                  <p className="flex items-center space-x-2 text-sm">
                    <i className="fas fa-envelope text-[#FF9933]"></i>
                    <span>support@indianotp.in</span>
                  </p>
                  <p className="flex items-center space-x-2 text-sm mt-1">
                    <i className="fab fa-telegram text-[#0066CC]"></i>
                    <span>@IndianOTPSupport</span>
                  </p>
                  <p className="flex items-center space-x-2 text-sm mt-1">
                    <i className="fab fa-instagram text-[#E1306C]"></i>
                    <span>indianotp.in</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomerSupport;
