import React, { useState, useEffect } from "react";
import { fetchTermsTemplates, createTermsTemplate } from "../../global/api/Terms.js";

const TermsManagement = () => {
  const [termsTemplates, setTermsTemplates] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "" });

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
      await createTermsTemplate(formData);
      alert("Terms template created successfully!");
      setFormData({ title: "", content: "" }); // Reset form
      const updatedTemplates = await fetchTermsTemplates(); // Refresh templates
      setTermsTemplates(updatedTemplates);
    } catch (error) {
      console.error("Failed to create terms template:", error);
    }
  };

  return (
    <div>
      <h1>Manage Terms & Conditions</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows="6"
            required
          ></textarea>
        </div>
        <button type="submit">Create Template</button>
      </form>
      <h2>Existing Templates</h2>
      <ul>
        {termsTemplates.map((template) => (
          <li key={template._id}>
            <strong>{template.title}</strong>: {template.content}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TermsManagement;
