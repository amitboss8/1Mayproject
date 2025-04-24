import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Landing: React.FC = () => {
  const [, navigate] = useLocation();
  
  const goToHome = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header showNav={true} />
      
      <main className="flex-grow">
        <section className="py-12 md:py-20 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
                  India's Trusted Source for <span className="text-[#FF9933]">Instant OTPs</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Generate secure one-time passwords instantly for all your verification needs.
                </p>
                <Button 
                  className="bg-[#FF9933] hover:bg-opacity-90 text-white font-medium py-3 px-8 rounded-md transition-all shadow-md hover:shadow-lg"
                  onClick={goToHome}
                >
                  Enter App
                </Button>
              </div>
              <div className="md:w-1/2 md:pl-12">
                <svg 
                  className="w-full h-auto max-w-md mx-auto rounded-lg shadow-xl"
                  viewBox="0 0 500 320" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Indian themed OTP illustration */}
                  <rect width="500" height="320" fill="#f8f9fa" rx="10" />
                  <path d="M80,160 Q250,60 420,160" stroke="#FF9933" strokeWidth="4" fill="none" />
                  <path d="M80,170 Q250,270 420,170" stroke="#138808" strokeWidth="4" fill="none" />
                  <circle cx="250" cy="165" r="40" fill="#0066CC" opacity="0.2" />
                  <circle cx="250" cy="165" r="30" fill="#0066CC" opacity="0.3" />
                  <g transform="translate(200, 130)">
                    <rect x="0" y="0" width="100" height="70" rx="5" fill="white" stroke="#0066CC" strokeWidth="2" />
                    <text x="12" y="24" fontSize="12" fill="#666">Your OTP is</text>
                    <text x="50" y="50" fontSize="24" fontWeight="bold" fill="#0066CC" textAnchor="middle">492108</text>
                  </g>
                  <g transform="translate(130, 200)">
                    <circle cx="15" cy="15" r="15" fill="#FF9933" />
                    <text x="15" y="20" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle">1</text>
                  </g>
                  <g transform="translate(360, 200)">
                    <circle cx="15" cy="15" r="15" fill="#138808" />
                    <text x="15" y="20" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle">6</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section id="trust" className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Why Choose Indian OTP?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Trust indicators */}
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
                <div className="text-[#FF9933] text-3xl mb-4 flex justify-center">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2 dark:text-white">Secure Platform</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">End-to-end encryption and no data storage policies to protect your privacy.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
                <div className="text-[#138808] text-3xl mb-4 flex justify-center">
                  <i className="fas fa-user-shield"></i>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2 dark:text-white">User-Friendly UI</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">Clean and intuitive interface designed for easy navigation and use.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
                <div className="text-[#0066CC] text-3xl mb-4 flex justify-center">
                  <i className="fas fa-bolt"></i>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2 dark:text-white">Fast OTP Generation</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">Instant generation of secure 6-digit one-time passwords.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
                <div className="text-[#FF9933] text-3xl mb-4 flex justify-center">
                  <i className="fas fa-headset"></i>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2 dark:text-white">24/7 Customer Support</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">Our team is always available to help with any questions or issues.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
                <div className="text-[#138808] text-3xl mb-4 flex justify-center">
                  <i className="fas fa-database"></i>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2 dark:text-white">No Data Storage</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">We don't store your OTPs or personal information, ensuring complete privacy.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
                <div className="text-[#0066CC] text-3xl mb-4 flex justify-center">
                  <i className="fas fa-tachometer-alt"></i>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2 dark:text-white">Fast Service Forever</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">Consistently quick performance you can rely on every time.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Landing;
