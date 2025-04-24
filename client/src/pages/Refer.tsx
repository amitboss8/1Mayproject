import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Refer: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showBackButton={true} />

      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-8 text-center dark:text-white">Refer & Earn</h1>

          <div className="grid gap-8 max-w-3xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Join Our Referral Program</CardTitle>
                <CardDescription>
                  Want to join our exclusive referral program? Follow these steps:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-lg mb-6 dark:text-gray-300">
                    To participate in our referral program, please contact us on Instagram:
                  </p>
                  <p className="flex items-center justify-center space-x-2 text-xl">
                    <i className="fab fa-instagram text-[#E1306C]"></i>
                    <a 
                      href="https://www.instagram.com/indianotp.in?igsh=c3RidXZrdXVuNHNi" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#E1306C] hover:text-[#E1306C]/80 transition-colors font-semibold"
                    >
                      @indianotp.in
                    </a>
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

export default Refer;