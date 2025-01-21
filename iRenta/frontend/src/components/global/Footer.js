import React from 'react'

export const Footer = () => {
  return (
    <footer 
    className="bg-blue-900 text-white py-8"
    style={{ 
      backgroundImage: "./assets/images/bg-overlay-footer.png", 
      backgroundSize: "cover", 
      backgroundPosition: "center", 
      backgroundBlendMode: "overlay" 
    }}
    >
      
    {/* </footer> */}
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      {/* Division 1: Logo/Icon */}
      <div className="flex justify-center md:justify-start">
        <div className="w-10 h-12 bg-gray-300 flex items-center justify-center">
          <img
              src="./assets/images/irenta.png"
              className="h-8 me-3"
              alt="iRenta Logo"
          />
        </div>
      </div>

      {/* Division 2: About Us Section */}
      <div>
        <h3 className="font-bold text-xl">About Us</h3>
         <ul className="mt-4 space-y-2">
           <li><a href="#" className="text-gray-400 hover:text-white">About iRenta</a></li>
           <li><a href="#" className="text-gray-400 hover:text-white">CONTACT US</a></li>
           <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
         </ul>
      </div>

      {/* Division 3: FAQs */}
      <div className="">
       <h3 className="font-bold text-xl">HELP & INFORMATION</h3>
       <ul className="mt-4 space-y-2">
         <li><a href="#" className="text-gray-400 hover:text-white">FAQS</a></li>
         <li><a href="#" className="text-gray-400 hover:text-white">Terms & Conditions</a></li>
         <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
       </ul>

      </div>

      {/* Division 4: Follow Us Section */}
      <div className="flex flex-col items-center md:items-start gap-4">
          <h3 className="text-lg font-semibold">FOLLOW US ON:</h3>
          <div className="flex flex-row items-center gap-4">
            <div className="w-50 h-50 flex items-center justify-center">
              <a href="#" className="flex items-center justify-center hover:bg-gray-500 transition rounded-full">
              <img
                src="./assets/images/facebook-icon.png"
                className="h-25 me-0.5"
                alt="facebook icon"
              />
              </a>
            </div>
            <div className="w-50 h-50 flex items-center justify-center">
              <a href="#" className="flex items-center justify-center hover:bg-gray-500 transition rounded-full">
              <img
                src="./assets/images/instagram-icon.png"
                className="h-25 me-0.5"
                alt="instagram icon"
              />
              </a>
            </div>
            <div className="w-50 h-50 flex items-center justify-center">
              <a href="#" className="flex items-center justify-center hover:bg-gray-500 transition rounded-full">
              <img
                src="./assets/images/x-icon.png"
                className="h-25 me-0.5"
                alt="twitter/x icon"
              />
              </a>
            </div>
          </div>
          <p className="text-sm text-center md:text-left">
          Copyright © 2025 - DingDorm
          </p>
        </div>
      </div>
  </footer>
  )
}