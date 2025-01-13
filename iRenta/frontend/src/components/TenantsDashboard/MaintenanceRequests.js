// frontend/src/components/TenantsDashboard/MaintenanceRequests.js
import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { AuthContext } from "../../global/contexts/AuthContext";
import {
  fetchTenantMaintenanceRequests,
  createMaintenanceRequest,
} from "../../global/api/Maintenance";
import { toast } from "react-toastify";

const MaintenanceRequests = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [requests, setRequests] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadMaintenanceRequests();
  }, [user?._id]);

  const validateFields = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    return newErrors;
  };

  const loadMaintenanceRequests = async () => {
    try {
      setIsLoading(true);
      if (user?._id) {
        const data = await fetchTenantMaintenanceRequests(user._id);
        setRequests(data);
      }
    } catch (error) {
      console.error("Error loading maintenance requests:", error);
      toast.error("Failed to load maintenance requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createMaintenanceRequest({
        title,
        description,
      });

      if (response.status === 201) {
        toast.success("Maintenance request created successfully!");
        setTitle("");
        setDescription("");
        setErrors({});
        loadMaintenanceRequests();
      }
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      toast.error("Failed to create maintenance request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-lg ${
        darkMode ? "bg-gray-800" : "bg-white"
      } p-6 shadow`}
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <h3 className="text-lg font-semibold mb-4">New Maintenance Request</h3>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter maintenance title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className={`w-full p-3 rounded-lg border ${
              darkMode
                ? "bg-gray-700 text-gray-300 border-gray-600"
                : "bg-white text-gray-800 border-gray-300"
            } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div className="mb-4">
          <textarea
            placeholder="Enter maintenance description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            rows="4"
            className={`w-full p-3 rounded-lg border ${
              darkMode
                ? "bg-gray-700 text-gray-300 border-gray-600"
                : "bg-white text-gray-800 border-gray-300"
            } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-lg ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request._id}
              className={`flex justify-between items-center p-4 rounded-lg ${
                darkMode ? "bg-gray-600" : "bg-white"
              } shadow`}
            >
              <div>
                <h4 className="text-lg font-semibold">{request.title}</h4>
                <p className="font-medium mb-2">{request.description}</p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-3 py-2 rounded-full text-sm ${
                  request.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : request.status === "In Progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {request.status}
              </span>
            </div>
          ))
        ) : (
          <p
            className={`text-center py-8 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No maintenance requests found.
          </p>
        )}
      </div>
    </div>
  );
};

export default MaintenanceRequests;
