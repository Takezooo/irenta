import React, { useState, useEffect, useContext } from "react";
import {
  fetchTermsTemplates,
  createTermsTemplate,
  updateTermsTemplate,
} from "../../global/api/Terms.js";
import { ThemeContext } from "../../contexts/ThemeContext";

const TermsManagement = () => {
  const { darkMode } = useContext(ThemeContext); // Access ThemeContext for dark mode
  const [termsTemplates, setTermsTemplates] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [editingTemplateId, setEditingTemplateId] = useState(null);

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

  return (
    <div
      className={`flex-grow pt-20 pb-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
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
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
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
      </div>
    </div>
  );
};

export default TermsManagement;
