import React, { useContext, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import Topbar from "../../components/global/Topbar";
import MaintenanceRequests from "../../components/TenantsDashboard/MaintenanceRequests";
import RentPayments from "../../components/TenantsDashboard/RentPayments";
import PropertyDetails from "../../components/TenantsDashboard/PropertyDetails";
import DashboardStats from "../../components/TenantsDashboard/DashboardStats";

const TenantsDashboard = () => {
  const { darkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "maintenance", label: "Maintenance" },
    { id: "payments", label: "Payments" },
    { id: "property", label: "Property" },
  ];

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <Topbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mt-16 mb-8">
          <h1 className="text-2xl font-bold">Tenant Dashboard</h1>

          {/* Tab Navigation */}
          <div className="border-b mt-4 mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 ${
                    activeTab === tab.id
                      ? `border-b-2 ${
                          darkMode ? "border-blue-400" : "border-blue-500"
                        }`
                      : ""
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "overview" && <DashboardStats />}
            {activeTab === "maintenance" && <MaintenanceRequests />}
            {activeTab === "payments" && <RentPayments />}
            {activeTab === "property" && <PropertyDetails />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantsDashboard;
