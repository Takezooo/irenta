import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../global/contexts/AuthContext.js";
import {
  fetchTermsTemplates,
  createTermsTemplate,
  updateTermsTemplate,
  attachTermsToListing,
} from "../../global/api/Terms.js";
import { fetchOwnerListings } from "../../global/api/Listings.js";
import { ThemeContext } from "../../contexts/ThemeContext";
import { toast } from "react-toastify";

const TermsManagement = () => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext); // Access ThemeContext for dark mode
  <style>
  {`
    /* Custom scrollbar styles */
    .overflow-y-auto::-webkit-scrollbar {
      width: 6px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-track {
      background: ${darkMode ? "#374151" : "#f3f4f6"};
      border-radius: 3px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: ${darkMode ? "#4B5563" : "#CBD5E0"};
      border-radius: 3px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: ${darkMode ? "#6B7280" : "#A0AEC0"};
    }
  `}
</style>
  const [termsTemplates, setTermsTemplates] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [listings, setListings] = useState([]); // Listings fetched from backend
  const [selectedListingId, setSelectedListingId] = useState(""); // Selected listing for attaching terms
  const [selectedTermsId, setSelectedTermsId] = useState(""); // Selected terms template for attaching
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    listing: "",
    terms: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  
  // Fetch terms templates and listings
  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const templates = await fetchTermsTemplates(user?.id);
      setTermsTemplates(templates);
    } catch (error) {
      console.error("Failed to fetch terms templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      const data = await fetchOwnerListings();
      setListings(data);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      toast.error("Failed to load listings");
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchListings();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = {};

    if (!formData.title.trim()) {
      validationErrors.title = "Title is required";
    }
    if (!formData.content.trim()) {
      validationErrors.content = "Content is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      
      if (editingTemplateId) {
        await updateTermsTemplate(editingTemplateId, formData);
        // Update the corresponding template in the state
        setTermsTemplates(prevTemplates => 
          prevTemplates.map(template => 
            template._id === editingTemplateId 
              ? { ...template, ...formData } 
              : template
          )
        );
        toast.success("Terms template updated successfully!");
        setEditingTemplateId(null);
      } else {
        const newTemplate = await createTermsTemplate(formData);
        // Add the new template to the state
        setTermsTemplates(prevTemplates => [...prevTemplates, newTemplate]);
        toast.success("Terms template created successfully!");
      }

      setFormData({ title: "", content: "" });
    } catch (error) {
      setErrors({ 
        submit: error.response?.data?.message || "Failed to save template" 
      });
      toast.error(error.response?.data?.message || "Failed to save template");
      console.error("Error saving template:", error);
    } finally {
      setIsLoading(false);
      // Refresh the list to ensure everything is in sync
      fetchTemplates();
    }
  };

  const handleEdit = (template) => {
    setFormData({ title: template.title, content: template.content });
    setEditingTemplateId(template._id);
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info("Editing template: " + template.title);
  };

  const handleCancelEdit = () => {
    setFormData({ title: "", content: "" });
    setEditingTemplateId(null);
    setErrors({});
    toast.info("Edit cancelled");
  };

  // Handle attaching terms to a listing
  const handleAttachTerms = async () => {
    let validationErrors = {};

    if (!selectedListingId) {
      validationErrors.listing = "Please select a listing";
    }
    if (!selectedTermsId) {
      validationErrors.terms = "Please select a terms template";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsAttaching(true);
      setErrors({});
      
      await attachTermsToListing({
        listingId: selectedListingId,
        termsAndConditionsId: selectedTermsId,
      });
      
      toast.success("Terms and Conditions attached successfully!");
      setSelectedListingId(""); // Clear selection
      setSelectedTermsId(""); // Clear selection
    } catch (error) {
      console.error("Failed to attach terms to listing:", error);
      setErrors({ 
        attach: error.response?.data?.message || "Failed to attach terms to listing" 
      });
      toast.error(error.response?.data?.message || "Failed to attach terms to listing");
    } finally {
      setIsAttaching(false);
    }
  };

  return (
    <div
      className={`flex-grow pt-20 pb-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"
      }`}
    >
      <div
        className={`shadow-md rounded-lg p-8 max-w-full mx-auto ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h1
          className={`text-3xl font-bold text-center mb-6 ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}
        >
          Manage Terms & Conditions
        </h1>

        {/* Form to Create or Edit a Terms Template */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className={`mt-1 block w-full border rounded-md shadow-sm px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows="6"
              required
              className={`mt-1 block w-full border rounded-md shadow-sm px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            ></textarea>
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">{errors.content}</p>
            )}
          </div>
          {errors.submit && (
            <p className="text-red-500 text-sm">{errors.submit}</p>
          )}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-4 px-4 py-2 rounded font-medium ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
              }`}
            >
              {isLoading ? "Processing..." : (editingTemplateId ? "Update Template" : "Create Template")}
            </button>
            {editingTemplateId && (
              <button
                type="button"
                disabled={isLoading}
                className={`w-full mt-4 px-4 py-2 rounded font-medium ${
                  darkMode
                    ? "bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed"
                    : "bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                }`}
                onClick={handleCancelEdit}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <hr className={`my-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />

        {/* Existing Templates List */}
        <h2
          className={`text-2xl font-semibold mb-4 ${
            darkMode ? "text-gray-300" : "text-gray-800"
          }`}
        >
          Existing Templates
        </h2>
        <div className="overflow-x-auto">
          <table
            className={`min-w-full border shadow-md rounded-lg ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/4 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Title
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-2/3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Content
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/12 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !termsTemplates.length ? (
                <tr>
                  <td
                    colSpan="3"
                    className={`px-6 py-4 text-center text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Loading templates...
                  </td>
                </tr>
              ) : termsTemplates.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className={`px-6 py-4 text-center text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No templates available.
                  </td>
                </tr>
              ) : (
                termsTemplates.map((template) => (
                  <tr
                    key={template._id}
                    className={`border-b ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    } ${editingTemplateId === template._id ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm break-words">
                        <strong
                          className={darkMode ? "text-gray-300" : "text-gray-800"}
                        >
                          {template.title}
                        </strong>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`text-sm whitespace-pre-wrap break-words max-h-40 overflow-y-auto ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                        style={{ maxWidth: "400px" }} // Adjust this value as needed
                      >
                        {template.content}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className={`px-4 py-2 rounded text-xs font-bold ${
                          darkMode
                            ? "bg-blue-600 text-white hover:bg-blue-500"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        } ${editingTemplateId === template._id ? 'opacity-50 cursor-default' : ''}`}
                        onClick={() => handleEdit(template)}
                        disabled={editingTemplateId === template._id}
                      >
                        {editingTemplateId === template._id ? "Editing..." : "Edit"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <hr className={`my-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />

        {/* Attach Terms to Listing Section */}
        <h2
          className={`text-2xl font-semibold mb-4 ${
            darkMode ? "text-gray-300" : "text-gray-800"
          }`}
        >
          Attach Terms to Listing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Select Listing
            </label>
            <select
              value={selectedListingId}
              onChange={(e) => setSelectedListingId(e.target.value)}
              className={`mt-1 block w-full border rounded-md shadow-sm px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              disabled={isAttaching}
            >
              <option value="">Select a Listing</option>
              {listings.map((listing) => (
                <option key={listing._id} value={listing._id}>
                  {listing.title}
                </option>
              ))}
            </select>
            {errors.listing && (
              <p className="text-red-500 text-xs mt-1">{errors.listing}</p>
            )}
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Select Terms Template
            </label>
            <select
              value={selectedTermsId}
              onChange={(e) => setSelectedTermsId(e.target.value)}
              className={`mt-1 block w-full border rounded-md shadow-sm px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  : "bg-white text-black border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              disabled={isAttaching}
            >
              <option value="">Select a Terms Template</option>
              {termsTemplates.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.title}
                </option>
              ))}
            </select>
            {errors.terms && (
              <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
            )}
          </div>
        </div>
        {errors.attach && (
          <p className="text-red-500 text-sm mt-2">{errors.attach}</p>
        )}
        <button
          onClick={handleAttachTerms}
          disabled={isAttaching}
          className={`w-full mt-4 px-4 py-2 rounded font-medium ${
            darkMode
              ? "bg-blue-600 text-white hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          }`}
        >
          {isAttaching ? "Attaching..." : "Attach Terms to Listing"}
        </button>
      </div>
    </div>
  );
};

export default TermsManagement;
