
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showBackButton={true} />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-8 text-center dark:text-white">Terms & Conditions</h1>
          
          <Card className="max-w-3xl mx-auto mb-8">
            <CardHeader>
              <CardTitle>Terms of Service Agreement</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="text-sm text-gray-500 mb-6">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
              
              <h3>1. Service Description</h3>
              <p>
                IndianOTP.in provides a professional SMS OTP verification service. Our platform enables users to receive OTP messages for various online services through our secure infrastructure.
              </p>
              
              <h3>2. Account Registration</h3>
              <p>
                Users must register with valid credentials to access our services. You are responsible for maintaining the confidentiality of your account information and all activities under your account.
              </p>
              
              <h3>3. Service Usage & Pricing</h3>
              <p>
                - Each OTP request is charged according to our current pricing structure
                - Charges are deducted automatically from your wallet balance
                - All transactions are final and non-refundable
                - Prices may vary based on service provider and availability
              </p>
              
              <h3>4. Wallet System</h3>
              <p>
                - Users must maintain sufficient balance in their wallet
                - Balance can be added through secure UPI payments
                - All balance addition requests are subject to verification
                - Minimum wallet recharge amount may apply
              </p>
              
              <h3>5. Service Reliability</h3>
              <p>
                We strive to maintain 99.9% service uptime. However, we cannot guarantee:
                - Delivery time of specific OTPs
                - Availability of all services at all times
                - Success rate for specific providers
              </p>
              
              <h3>6. Prohibited Activities</h3>
              <p>
                Users shall not:
                - Use our service for any illegal activities
                - Attempt to bypass our security measures
                - Share account access with unauthorized users
                - Resell our services without authorization
                - Use automated scripts without permission
              </p>
              
              <h3>7. Data Privacy</h3>
              <p>
                - We do not store OTP messages permanently
                - Transaction records are kept for accounting purposes
                - User data is encrypted and secured
                - We comply with all applicable privacy laws
              </p>
              
              <h3>8. Service Limitations</h3>
              <p>
                - Daily OTP request limits may apply
                - Service availability varies by provider
                - Certain numbers may be temporarily unavailable
                - Technical limitations may affect service delivery
              </p>
              
              <h3>9. Account Suspension</h3>
              <p>
                We reserve the right to suspend or terminate accounts for:
                - Violation of these terms
                - Suspicious activity
                - Non-payment or payment disputes
                - Abuse of our services
              </p>
              
              <h3>10. Customer Support</h3>
              <p>
                - 24/7 customer support available
                - Priority support for premium users
                - Technical assistance via email/chat
                - Resolution time varies by issue complexity
              </p>
              
              <h3>11. Changes to Terms</h3>
              <p>
                We may update these terms at any time. Continued use of our service constitutes acceptance of any changes.
              </p>
              
              <h3>12. Contact Information</h3>
              <p>
                For support or inquiries, contact us at:
                Email: support@indianotp.in
                Response Time: Within 24 hours
              </p>
              
              <p className="text-sm italic mt-8">
                By using our service, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
