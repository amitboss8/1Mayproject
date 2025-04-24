import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <span className="text-[#FF9933] font-bold text-xl">Indian</span>
              <span className="text-green-400 font-bold text-xl">OTP</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center space-x-4 mb-4 md:mb-0">
            <Link href="/home" className="text-gray-300 hover:text-white transition-all">Home</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-all">Contact</Link>
            <Link href="/terms" className="text-gray-300 hover:text-white transition-all">Terms</Link>
            <Link href="/support" className="text-gray-300 hover:text-white transition-all">Support</Link>
          </div>
          <div className="text-gray-400 text-sm">
            <p>Made with ❤️ in India</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
