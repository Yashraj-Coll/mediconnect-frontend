import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-600 text-white font-bold text-2xl h-10 w-10 rounded-lg flex items-center justify-center mr-2">
                M<span className="text-orange-400">+</span>
              </div>
              <span className="font-bold text-xl">MediConnect Health</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Connecting patients with top specialists through secure video consultations and AI-powered health insights.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="/team" className="text-gray-400 hover:text-white transition">Our Team</a></li>
                <li><a href="/careers" className="text-gray-400 hover:text-white transition">Careers</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="/video-consultation" className="text-gray-400 hover:text-white transition">Video Consultation</a></li>
                <li><a href="/ai-diagnostics" className="text-gray-400 hover:text-white transition">AI Diagnostics</a></li>
                <li><a href="/health-records" className="text-gray-400 hover:text-white transition">Health Records</a></li>
                <li><a href="/doctors" className="text-gray-400 hover:text-white transition">Find a Doctor</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <p className="text-gray-400 mb-2">contact@mediconnect.com</p>
              <p className="text-gray-400">+91 9876543210</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400">© 2025 MediConnect Health. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;