import React, { useState, useContext  } from "react";
import TenantsList from "./TenantsList";
import RentTracker from './RentTracker';
import MaintenanceRequests from './MaintenanceRequests';
import Reports from './Reports';
import { ThemeContext } from "../../../contexts/ThemeContext";

const ManageTenant = () => {
  const [activeTab, setActiveTab] = useState('main');
  const { darkMode } = useContext(ThemeContext); // Access dark mode context

  const tabs = [
    { id: 'tenants', label: 'Manage Tenants' },
    { id: 'rent', label: 'Rent Tracker' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'reports', label: 'Reports' },
  ];

    const renderContent = () => {
    switch (activeTab) {
      case 'overview':
       return <TenantsList />;
      case 'rent':
       return <RentTracker />;
      case 'maintenance':
        return <MaintenanceRequests />;
      case 'reports':
       return <Reports />;
      default:
        return <TenantsList />;
    }
  };


  return (
    <div className={`min-h-screen ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">         
          {/* Tab Navigation */}
          <div className="border-b mt-20 mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 transition-colors duration-150 text-2xl font-bold text-center${
                    activeTab === tab.id
                      ? `border-b-2 ${darkMode ? 'border-blue-400 text-blue-400' : 'border-blue-500 text-blue-500'}`
                      : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* {activeTab === 'overview' && (
            // <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            //   <div className={`p-4 rounded-lg ${
            //     darkMode ? 'bg-gray-800' : 'bg-blue-900 text-white'
            //   }`}>
            //     <h3 className="text-sm opacity-75">Total Properties</h3>
            //     <p className="text-2xl font-bold mt-2">12</p>
            //   </div>
            //   <div className={`p-4 rounded-lg ${
            //     darkMode ? 'bg-gray-800' : 'bg-blue-900 text-white'
            //   }`}>
            //     <h3 className="text-sm opacity-75">Active Tenants</h3>
            //     <p className="text-2xl font-bold mt-2">8</p>
            //   </div>
            //   <div className={`p-4 rounded-lg ${
            //     darkMode ? 'bg-gray-800' : 'bg-blue-900 text-white'
            //   }`}>
            //     <h3 className="text-sm opacity-75">Pending Maintenance</h3>
            //     <p className="text-2xl font-bold mt-2">3</p>
            //   </div>
            //   <div className={`p-4 rounded-lg ${
            //     darkMode ? 'bg-gray-800' : 'bg-blue-900 text-white'
            //   }`}>
            //     <h3 className="text-sm opacity-75">This Month's Revenue</h3>
            //     <p className="text-2xl font-bold mt-2">$24,500</p>
            //   </div>
            // </div>
            <div
            className={`mt-16 flex-grow p-6 pb-4 ${
              darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
            }`}
          >
            <h1 className="text-2xl font-bold mb-6">Manage Tenants</h1>
      
            {/* Waitlist Section */}
            {/* <div className="mb-8">
              <Waitlist />
            </div>
    
          </div>
          )} */} 

          {/* Tab Content */}
          <div className={`mt-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow-sm`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
);
};

export default ManageTenant;
