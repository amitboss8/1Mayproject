
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

          <Card className="max-w-3xl mx-auto mt-8 border-t-4 border-[#FF9933]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-center">Frequently Asked Questions</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Essential information about our OTP verification services</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-[#0066CC] dark:text-[#FF9933]">
                    <i className="fas fa-shield-alt mr-2"></i>
                    What is IndianOTP's verification service?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    IndianOTP.in provides instant virtual phone numbers for receiving OTP verification codes. Our service is designed for testing and verification purposes, offering reliable and secure OTP reception across multiple platforms.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-[#0066CC] dark:text-[#FF9933]">
                    <i className="fas fa-rupee-sign mr-2"></i>
                    What are your service charges?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our services are priced affordably starting from just ₹1.13 per OTP. Different services may have varying rates based on complexity and demand. All charges are transparently displayed before purchase.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-[#0066CC] dark:text-[#FF9933]">
                    <i className="fas fa-wallet mr-2"></i>
                    How does the wallet system work?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Add funds to your wallet using UPI payments (Google Pay, PhonePe, Paytm). The cost of each OTP is automatically deducted from your wallet balance. Maintain sufficient balance for uninterrupted service.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-[#0066CC] dark:text-[#FF9933]">
                    <i className="fas fa-clock mr-2"></i>
                    How fast is the OTP delivery?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our system delivers OTPs instantly upon successful payment. The entire process typically takes just a few seconds, ensuring you can complete your verifications without delay.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-[#0066CC] dark:text-[#FF9933]">
                    <i className="fas fa-lock mr-2"></i>
                    Is the service secure?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Yes, we implement bank-grade security measures. All transactions are encrypted, and we don't store OTPs permanently. Your privacy and security are our top priorities.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-[#0066CC] dark:text-[#FF9933]">
                    <i className="fas fa-headset mr-2"></i>
                    What if I need support?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our dedicated customer support team is available 24/7. Contact us through email at support@indianotp.in for immediate assistance with any issues or concerns.
                  </p>
                </div>
              </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-[#0066CC] dark:text-[#FF9933]">
                    <i className="fas fa-info-circle mr-2"></i>
                    What is IndianOTP.in?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    IndianOTP.in is India's leading SMS OTP verification service, providing instant access to temporary phone numbers for secure verification needs. Our platform ensures safe and reliable OTP reception for all major services.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-[#0066CC] dark:text-[#FF9933]">
                    <i className="fas fa-cogs mr-2"></i>
                    How does the service work?
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="bg-[#FF9933] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">1</span>
                      <p>Choose your desired service from our comprehensive list</p>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-[#FF9933] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">2</span>
                      <p>Make a secure payment (starting at just ₹1.13)</p>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-[#FF9933] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">3</span>
                      <p>Receive your OTP instantly</p>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-[#FF9933] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3">4</span>
                      <p>Complete your verification process</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-[#0066CC] dark:text-[#FF9933]">
                    <i className="fas fa-shield-alt mr-2"></i>
                    Is this service legal and secure?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Yes, our service operates within legal frameworks, providing virtual numbers for legitimate verification purposes. We implement bank-grade security measures to protect all transactions and user data.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-[#0066CC] dark:text-[#FF9933]">
                    <i className="fas fa-wallet mr-2"></i>
                    What payment methods are accepted?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We support all major UPI payment platforms including:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                    <div className="text-center">
                      <i className="fab fa-google-pay text-2xl text-[#0066CC]"></i>
                      <p className="text-sm mt-1">Google Pay</p>
                    </div>
                    <div className="text-center">
                      <i className="fas fa-mobile-alt text-2xl text-[#0066CC]"></i>
                      <p className="text-sm mt-1">PhonePe</p>
                    </div>
                    <div className="text-center">
                      <i className="fas fa-money-bill-wave text-2xl text-[#0066CC]"></i>
                      <p className="text-sm mt-1">Paytm</p>
                    </div>
                    <div className="text-center">
                      <i className="fas fa-university text-2xl text-[#0066CC]"></i>
                      <p className="text-sm mt-1">BHIM UPI</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-[#0066CC] dark:text-[#FF9933]">
                    <i className="fas fa-headset mr-2"></i>
                    Need help or support?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our dedicated support team is available 24/7 to assist you. In case of any issues with OTP delivery or other concerns, reach out to us immediately through our support channels.
                  </p>
                  <div className="mt-3 flex items-center space-x-4">
                    <button className="flex items-center text-[#0066CC] hover:text-[#FF9933]">
                      <i className="fas fa-envelope mr-2"></i>
                      Email Support
                    </button>
                    <button className="flex items-center text-[#0066CC] hover:text-[#FF9933]">
                      <i className="fas fa-comments mr-2"></i>
                      Live Chat
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
