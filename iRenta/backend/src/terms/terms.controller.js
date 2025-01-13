import Terms from "./terms.model.js";
import Listing from "../listings/listings.model.js";
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

export const fetchTermsById = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the terms by ID
    const terms = await Terms.findById(id);
    if (!terms) {
      return res.status(404).json({ message: "Terms and Conditions not found" });
    }

    res.status(200).json(terms);
  } catch (error) {
    console.error("Error fetching terms by ID:", error);
    res.status(500).json({ message: "Failed to fetch Terms and Conditions" });
  }
};

export const attachTermsToListing = async (req, res) => {
  const { listingId, termsAndConditionsId } = req.body;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const terms = await Terms.findById(termsAndConditionsId);
    if (!terms) {
      return res.status(404).json({ message: "Terms and Conditions not found." });
    }

    listing.termsAndConditionsId = termsAndConditionsId; // Attach the template
    await listing.save();

    res.status(200).json({ message: "Terms and Conditions attached successfully.", listing });
  } catch (error) {
    console.error("Error attaching terms to listing:", error);
    res.status(500).json({ message: "Failed to attach terms to listing." });
  }
};


