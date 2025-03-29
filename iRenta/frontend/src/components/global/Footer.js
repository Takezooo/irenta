import React from 'react';

export const Footer = () => {
  return (
    <footer 
      className="bg-gray-700 text-white py-8"
      style={{ 
        backgroundImage: "url('./assets/images/bg-overlay-footer.png')", 
        backgroundSize: "cover", 
        backgroundPosition: "center", 
        backgroundBlendMode: "overlay" 
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4">
        {/* Logo Section */}
        <div className="hidden sm:flex justify-center md:justify-start">
          <img
            src="./assets/images/irenta.png"
            className="h-12"
            alt="iRenta Logo"
          />
        </div>

        {/* About Us Section */}
        <div className="hidden sm:block">
          <h3 className="font-bold text-xl">About Us</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white">About iRenta</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
          </ul>
        </div>

        {/* Help & Information Section */}
        <div className="hidden sm:block">
          <h3 className="font-bold text-xl">Help & Information</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white">FAQs</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Terms & Conditions</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Follow Us Section */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <h3 className="hidden sm:flex text-lg font-semibold">Follow Us On:</h3>
          <div className="hidden sm:flex gap-4">
            {['facebook', 'instagram', 'x'].map((platform) => (
              <a key={platform} href="#" className="hover:opacity-75 transition">
                <img
                  src={`./assets/images/${platform}-icon.png`}
                  className="h-8 w-8"
                  alt={`${platform} icon`}
                />
              </a>
            ))}
          </div>
          <p className="text-sm text-center md:text-left">
            Copyright © 2025 - DingDorm
          </p>
        </div>
      </div>
    </footer>
  );
};
