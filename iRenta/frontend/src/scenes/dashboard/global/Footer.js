import React from 'react'

export const Footer = () => {
  return (
    <footer className="mt-12 bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm">&copy; 2024 iRenta. All rights reserved.</p>
            <p className="text-sm mt-2">
              <a href="#" className="underline text-blue-400">Privacy Policy</a> | <a href="#" className="underline text-blue-400">Terms of Service</a>
            </p>
          </div>
        </div>
    </footer>
  )
}
