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
              <CardTitle>Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Welcome to Indian OTP. By accessing or using our service, you agree to be bound by these Terms & Conditions.
              </p>
              
              <h3>1. Service Usage</h3>
              <p>
                Indian OTP provides a service that generates random one-time passwords (OTPs) for testing and verification purposes. Users are responsible for how these OTPs are used and must comply with all applicable laws and regulations.
              </p>
              
              <h3>2. Data Privacy</h3>
              <p>
                We do not collect or store any personal data beyond what is necessary to provide our service. OTPs generated through our platform are not recorded or stored permanently in our systems. We maintain transaction records solely for the purpose of wallet balance management.
              </p>
              
              <h3>3. Wallet & Payments</h3>
              <p>
                Users can add balance to their wallet through UPI payments. All payments are voluntary donations to support our service. Once an OTP is generated, the corresponding amount will be deducted from your wallet balance automatically.
              </p>
              
              <h3>4. Refund Policy</h3>
              <p>
                We do not offer refunds for OTPs once they are generated. Please ensure you have sufficient balance and need an OTP before generating it.
              </p>
              
              <h3>5. Accuracy & Reliability</h3>
              <p>
                While we strive to provide a reliable service, we make no guarantees regarding the accuracy, reliability, or availability of our OTP generation service. Users acknowledge that OTPs are generated randomly and are not meant for critical production systems.
              </p>
              
              <h3>6. Limitation of Liability</h3>
              <p>
                Indian OTP shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages resulting from your use or inability to use the service.
              </p>
              
              <h3>7. Modifications to Service</h3>
              <p>
                We reserve the right to modify or discontinue the service at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
              </p>
              
              <h3>8. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
              </p>
              
              <h3>9. Contact</h3>
              <p>
                If you have any questions about these Terms, please contact us at legal@indianotp.in.
              </p>
              
              <p className="text-sm italic mt-8">
                Last updated: June 1, 2023
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
