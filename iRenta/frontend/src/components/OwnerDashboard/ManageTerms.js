import React, { useState, useEffect, useContext } from "react";
import {
  fetchTermsTemplates,
  createTermsTemplate,
  updateTermsTemplate,
} from "../../global/api/Terms.js";
import { attachTermsToListing } from "../../global/api/Terms.js"; // API to attach terms to listings
import { ThemeContext } from "../../contexts/ThemeContext";

const TermsManagement = () => {
  const { darkMode } = useContext(ThemeContext); // Access ThemeContext for dark mode
  const [termsTemplates, setTermsTemplates] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [listings, setListings] = useState([]); // Listings fetched from backend
  const [selectedListingId, setSelectedListingId] = useState(""); // Selected listing for attaching terms
  const [selectedTermsId, setSelectedTermsId] = useState(""); // Selected terms template for attaching

  // Fetch terms templates and listings
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templates = await fetchTermsTemplates();
        setTermsTemplates(templates);
      } catch (error) {
        console.error("Failed to fetch terms templates:", error);
      }
    };

    const fetchListings = async () => {
      try {
        const response = await fetch("/api/listings"); // Adjust API route if needed
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      }
    };

    fetchTemplates();
    fetchListings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTemplateId) {
        await updateTermsTemplate(editingTemplateId, formData);
        alert("Terms template updated successfully!");
        setEditingTemplateId(null);
      } else {
        await createTermsTemplate(formData);
        alert("Terms template created successfully!");
      }

      setFormData({ title: "", content: "" });
      const updatedTemplates = await fetchTermsTemplates();
      setTermsTemplates(updatedTemplates);
    } catch (error) {
      console.error("Failed to save terms template:", error);
    }
  };

  const handleEdit = (template) => {
    setFormData({ title: template.title, content: template.content });
    setEditingTemplateId(template._id);
  };

  const handleCancelEdit = () => {
    setFormData({ title: "", content: "" });
    setEditingTemplateId(null);
  };

  // Handle attaching terms to a listing
  const handleAttachTerms = async () => {
    if (!selectedListingId || !selectedTermsId) {
      alert("Please select both a listing and a terms template.");
      return;
    }

    try {
      await attachTermsToListing({
        listingId: selectedListingId,
        termsAndConditionsId: selectedTermsId,
      });
      alert("Terms and Conditions attached successfully!");
      setSelectedListingId(""); // Clear selection
      setSelectedTermsId(""); // Clear selection
    } catch (error) {
      console.error("Failed to attach terms to listing:", error);
      alert("Failed to attach terms to listing.");
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
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className={`w-full mt-4 px-4 py-2 rounded font-medium ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {editingTemplateId ? "Update Template" : "Create Template"}
            </button>
            {editingTemplateId && (
              <button
                type="button"
                className={`w-full mt-4 px-4 py-2 rounded font-medium ${
                  darkMode
                    ? "bg-gray-600 text-white hover:bg-gray-500"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
                onClick={handleCancelEdit}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Existing Templates List */}
        <h2
          className={`text-2xl font-semibold mt-8 mb-4 ${
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
                {["Title", "Content", "Actions"].map((header) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {termsTemplates.map((template) => (
                <tr
                  key={template._id}
                  className={`border-b ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <strong
                      className={darkMode ? "text-gray-300" : "text-gray-800"}
                    >
                      {template.title}
                    </strong>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {template.content}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      className={`px-4 py-2 rounded text-xs font-bold ${
                        darkMode
                          ? "bg-blue-600 text-white hover:bg-blue-500"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                      onClick={() => handleEdit(template)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {termsTemplates.length === 0 && (
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
              )}
            </tbody>
          </table>
        </div>

        {/* Attach Terms to Listing Section */}
        <h2
          className={`text-2xl font-semibold mt-8 mb-4 ${
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
            >
              <option value="">Select a Listing</option>
              {listings.map((listing) => (
                <option key={listing._id} value={listing._id}>
                  {listing.title}
                </option>
              ))}
            </select>
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
            >
              <option value="">Select a Terms Template</option>
              {termsTemplates.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleAttachTerms}
          className={`w-full mt-4 px-4 py-2 rounded font-medium ${
            darkMode
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Attach Terms to Listing
        </button>
      </div>
    </div>
  );
};

export default TermsManagement;
