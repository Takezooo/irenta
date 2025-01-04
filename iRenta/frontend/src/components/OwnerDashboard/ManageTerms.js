import React, { useState, useEffect } from "react";
import {
  fetchTermsTemplates,
  createTermsTemplate,
  updateTermsTemplate, // Import API to update templates
} from "../../global/api/Terms.js";

const TermsManagement = () => {
  const [termsTemplates, setTermsTemplates] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [editingTemplateId, setEditingTemplateId] = useState(null); // Track if editing a template

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templates = await fetchTermsTemplates();
        setTermsTemplates(templates);
      } catch (error) {
        console.error("Failed to fetch terms templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTemplateId) {
        // Update existing template
        await updateTermsTemplate(editingTemplateId, formData);
        alert("Terms template updated successfully!");
        setEditingTemplateId(null); // Reset editing state
      } else {
        // Create new template
        await createTermsTemplate(formData);
        alert("Terms template created successfully!");
      }

      setFormData({ title: "", content: "" }); // Reset form
      const updatedTemplates = await fetchTermsTemplates(); // Refresh templates
      setTermsTemplates(updatedTemplates);
    } catch (error) {
      console.error("Failed to save terms template:", error);
    }
  };

  const handleEdit = (template) => {
    // Populate form with selected template data
    setFormData({ title: template.title, content: template.content });
    setEditingTemplateId(template._id); // Track the ID of the template being edited
  };

  const handleCancelEdit = () => {
    // Reset form and editing state
    setFormData({ title: "", content: "" });
    setEditingTemplateId(null);
  };

  return (
    <div className="flex-grow pt-20 pb-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-6">
          Manage Terms & Conditions
        </h1>

        {/* Form to Create or Edit a Terms Template */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows="6"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2"
            ></textarea>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600"
            >
              {editingTemplateId ? "Update Template" : "Create Template"}
            </button>
            {editingTemplateId && (
              <button
                type="button"
                className="w-full mt-4 px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded hover:bg-gray-600"
                onClick={handleCancelEdit}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Existing Templates List */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
          Existing Templates
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {termsTemplates.map((template) => (
                <tr key={template._id} className="border-b">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <strong>{template.title}</strong>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {template.content}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600"
                      onClick={() => handleEdit(template)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {termsTemplates.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    No templates available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TermsManagement;
