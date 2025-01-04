import Terms from "./terms.model.js";

// Fetch all terms templates
export const fetchTermsTemplates = async (req, res) => {
  try {
    const terms = await Terms.find();
    res.status(200).json(terms);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch terms templates" });
  }
};

// Create a new terms template
export const createTermsTemplate = async (req, res) => {
  const { title, content, createdBy } = req.body;

  try {
    const newTerms = new Terms({
      title,
      content,
      createdBy: req.user.id, // The landlord creating the template
    });

    await newTerms.save();
    res.status(201).json({ message: "Terms template created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTermsTemplate = async (req, res) => {
    const { id } = req.params;
  const { title, content } = req.body;

  try {
    const updatedTemplate = await Terms.findByIdAndUpdate(
      id,
      { title, content },
      { new: true, runValidators: true } // Return the updated document and validate the changes
    );

    if (!updatedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json(updatedTemplate);
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({ message: "Failed to update template" });
  }
};

