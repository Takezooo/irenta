import PDFDocument from "pdfkit";
import { PassThrough } from 'stream';

const generatePdf = async (leaseData, tenant) => {
  try {
    // Create a new PDF document with proper margins for A4
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true, // Required for page numbering
      info: {
        Title: 'Residential Lease Agreement',
        Author: 'iRenta',
      }
    });
    
    // Create a PassThrough stream to which we'll pipe the document
    const stream = new PassThrough();
    
    // Handle stream errors
    stream.on('error', (err) => {
      console.error("PDF Stream Error:", err);
    });
    
    // Pipe the PDF document to the PassThrough stream
    doc.pipe(stream);
  
    // Helper function to check if we need a new page
    const checkForNewPage = (neededHeight = 100) => {
      try {
        if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error checking for new page:", error);
        // Add page as a fallback
        doc.addPage();
        return true;
      }
    };
  
    // Safe text helper to prevent NaN errors
    const safeText = (text, options = {}) => {
      try {
        // Ensure text is a string
        const safeTextContent = String(text || "");
        doc.text(safeTextContent, options);
      } catch (error) {
        console.error("Error adding text:", error, text);
        // Try minimal options to recover
        try {
          doc.text(String(text || ""));
        } catch (innerError) {
          console.error("Failed to add text with minimal options:", innerError);
        }
      }
    };
  
    // Helper function to add a simple label-value pair
    const addLineItem = (label, value, options = {}) => {
      try {
        doc.font('Helvetica-Bold');
        safeText(`${label}: `, { continued: true });
        doc.font('Helvetica');
        safeText(value || "", options);
      } catch (error) {
        console.error(`Error adding line item ${label}:`, error);
        // Fallback to simple text
        try {
          doc.font('Helvetica').text(`${label}: ${value || ""}`);
        } catch (innerError) {
          console.error("Failed to add line item with fallback method:", innerError);
        }
      }
    };
  
    // Format dates consistently
    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } catch (e) {
        return "";
      }
    };
  
    // Format currency as Philippine Peso
    const formatCurrency = (amount) => {
      if (amount === undefined || amount === null || isNaN(amount)) return "₱0.00";
      return `₱${parseFloat(amount).toFixed(2)}`;
    };

    // Safe wrapper for drawing rectangles
    const safeRect = (x, y, width, height, fillColor = null) => {
      try {
        // Validate all parameters are numbers and not NaN
        if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
          console.error("Invalid rectangle coordinates:", { x, y, width, height });
          return;
        }
        
        // Create the rectangle
        const rect = doc.rect(x, y, width, height);
        
        // Fill if a color is provided
        if (fillColor) {
          doc.fill(fillColor);
        }
        
        return rect;
      } catch (error) {
        console.error("Error drawing rectangle:", error);
      }
    };

    // TITLE AND REFERENCE
    doc.font('Helvetica-Bold').fontSize(14);
    safeText("RESIDENTIAL LEASE AGREEMENT", { align: "center" });
    doc.moveDown(0.5);
  
    doc.fontSize(8).font('Helvetica');
    safeText(`Reference #: ${leaseData._id || ""}`, { align: "right" });
    safeText(`Date: ${formatDate(new Date())}`, { align: "right" });
    doc.moveDown(0.5);
  
    // PROPERTY INFORMATION
    doc.font('Helvetica-Bold').fontSize(10);
    safeText("PROPERTY INFORMATION", { underline: true });
    doc.moveDown(0.3);
  
    let fullAddress = "";
    try {
      const address = leaseData.property?.address || {};
      const parts = [
        address.houseNumber,
        address.street,
        address.city,
        address.zip
      ].filter(Boolean);
      fullAddress = parts.length > 0 ? parts.join(", ") : "Address not provided";
    } catch (error) {
      console.error("Error formatting property address:", error);
      fullAddress = "Address not available";
    }
  
    addLineItem("Property Name", leaseData.property?.name || "Name not provided");
    addLineItem("Property Address", fullAddress);
    doc.moveDown(0.5);
  
    // PARTIES
    doc.font('Helvetica-Bold').fontSize(10);
    safeText("PARTIES", { underline: true });
    doc.moveDown(0.3);
  
    addLineItem("Landlord", leaseData.landlordName);
  
    // Tenant information
    let tenantName = "";
    let tenantEmail = "";
    let tenantPhone = "";
  
    if (tenant) {
      tenantName = `${tenant.info?.firstName || ""} ${tenant.info?.lastName || ""}`.trim();
      tenantEmail = tenant.credentials?.email || "";
      tenantPhone = tenant.info?.phoneNumber || "";
    } else if (leaseData.tenantPlaceholder) {
      tenantName = leaseData.tenantPlaceholder.name || "";
      tenantEmail = leaseData.tenantPlaceholder.email || "";
      tenantPhone = leaseData.tenantPlaceholder.phoneNumber || "";
    }
  
    addLineItem("Tenant", tenantName);
    addLineItem("Email", tenantEmail);
    addLineItem("Phone", tenantPhone);
  
    if (leaseData.tenantPlaceholder?.emergencyContact?.name) {
      addLineItem("Emergency Contact", leaseData.tenantPlaceholder.emergencyContact.name);
      addLineItem("Emergency Contact Phone", leaseData.tenantPlaceholder.emergencyContact.phoneNumber);
    }
    doc.moveDown(0.5);
  
    // LEASE TERMS
    checkForNewPage();
    doc.font('Helvetica-Bold').fontSize(10);
    safeText("LEASE TERMS", { underline: true });
    doc.moveDown(0.3);
  
    const terms = leaseData.contractDetails || {};
    addLineItem("Lease Type", leaseData.leaseType);
    addLineItem("Start Date", formatDate(terms.startDate));
    addLineItem("End Date", formatDate(terms.endDate));
    addLineItem("Move-in Date", formatDate(terms.moveInDate));
    addLineItem("Move-out Date", formatDate(terms.moveOutDate));
    doc.moveDown(0.5);
  
    // FINANCIAL DETAILS
    checkForNewPage();
    doc.font('Helvetica-Bold').fontSize(10);
    safeText("FINANCIAL DETAILS", { underline: true });
    doc.moveDown(0.3);
  
    // Base rent and deposit
    const rentBreakdown = leaseData.contractDetails?.rentBreakdown || {};
    addLineItem("Base Rent", formatCurrency(rentBreakdown.baseRent));
    addLineItem("Deposit Amount", formatCurrency(terms.depositAmount));
    addLineItem("Payment Frequency", terms.paymentFrequency || "");
    doc.moveDown(0.5);
  
    // Function to create clean fee tables like in the screenshot
    const createFeeTable = (title, items, tablePadding = 10) => {
      try {
        // Ensure items is a valid array and has content
        if (!items || !Array.isArray(items) || items.length === 0) {
          doc.font('Helvetica-Bold').fontSize(10);
          safeText(title);
          doc.moveDown(0.3);
          doc.font('Helvetica');
          safeText("None");
          doc.moveDown(0.5);
          return;
        }
        
        // Filter out invalid items first
        const validItems = items.filter(item => item && typeof item === 'object');
        
        if (validItems.length === 0) {
          doc.font('Helvetica-Bold').fontSize(10);
          safeText(title);
          doc.moveDown(0.3);
          doc.font('Helvetica');
          safeText("None");
          doc.moveDown(0.5);
          return;
        }
        
        // Calculate needed height based on number of items
        const neededHeight = Math.min(validItems.length * 20 + 50, 150); // Cap at reasonable height
        
        if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
        }
        
        doc.font('Helvetica-Bold').fontSize(10);
        safeText(title);
        doc.moveDown(0.3);
        
        // Set up table dimensions with safe values
        const startX = Math.max(doc.x, doc.page.margins.left);
        const colWidth = Math.max(100, doc.page.width - doc.page.margins.left - doc.page.margins.right);
        const colDivide = 0.7; // 70% for item name, 30% for cost
        
        // Calculate safe tablePadding
        const safePadding = Math.max(2, Math.min(tablePadding, 20));
        
        // Draw table headers - safer approach with explicit coordinates
        const headerY = doc.y;
        
        // Draw header background with safety checks
        safeRect(startX, headerY, colWidth, 20, "#f0f0f0");
        doc.fillColor("#000000");
        
        doc.font('Helvetica-Bold').fontSize(10);
        
        // Ensure text coordinates are valid numbers and within page
        const textX1 = startX + safePadding;
        const textX2 = startX + (colWidth * colDivide) + safePadding;
        const textY = headerY + safePadding;
        
        // Add header texts with safety checks
        if (!isNaN(textX1) && !isNaN(textY)) {
          try {
            doc.text("Item", textX1, textY);
          } catch (error) {
            console.error("Error drawing 'Item' header:", error);
          }
        }
        
        if (!isNaN(textX2) && !isNaN(textY)) {
          try {
            doc.text("Cost", textX2, textY);
          } catch (error) {
            console.error("Error drawing 'Cost' header:", error);
          }
        }
        
        // Set Y position after header
        doc.y = headerY + 20 + 5; // Add spacing after header
        
        // Draw rows for each item
        validItems.forEach((item, index) => {
          try {
            // Check if we need a new page before adding this item
            if (doc.y + 20 > doc.page.height - doc.page.margins.bottom) {
              doc.addPage();
              
              // Re-establish table headers on the new page with safe coordinates
              const newHeaderY = doc.y;
              
              // Draw header background with safety checks
              safeRect(startX, newHeaderY, colWidth, 20, "#f0f0f0");
              doc.fillColor("#000000");
              doc.font('Helvetica-Bold').fontSize(10);
              
              // Safe text positioning for new page headers
              if (!isNaN(textX1) && !isNaN(newHeaderY + safePadding)) {
                try {
                  doc.text("Item", textX1, newHeaderY + safePadding);
                } catch (error) {
                  console.error("Error drawing 'Item' header on new page:", error);
                }
              }
              
              if (!isNaN(textX2) && !isNaN(newHeaderY + safePadding)) {
                try {
                  doc.text("Cost", textX2, newHeaderY + safePadding);
                } catch (error) {
                  console.error("Error drawing 'Cost' header on new page:", error);
                }
              }
              
              doc.y = newHeaderY + 20; // Space for header
            }
            
            const rowY = doc.y;
            const rowHeight = 20;
            
            // Draw row background (alternating colors) with safety checks
            if (index % 2 === 0) {
              safeRect(startX, rowY, colWidth, rowHeight, "#f9f9f9");
            } else {
              safeRect(startX, rowY, colWidth, rowHeight, "#ffffff");
            }
            doc.fillColor("#000000");
            
            // Draw item name and cost with safe values and coordinate checks
            const name = (item.name || "").toString().substring(0, 50); // Limit name length
            const amount = item.amount !== undefined ? parseFloat(item.amount) : null;
            const cost = !isNaN(amount) ? formatCurrency(amount) : "Included";
            
            doc.font('Helvetica').fontSize(9);
            
            // Calculate text positions with safety checks
            const nameX = startX + safePadding;
            const costX = startX + (colWidth * colDivide) + safePadding;
            const contentY = rowY + safePadding;
            
            // Only draw text if coordinates are valid numbers
            if (!isNaN(nameX) && !isNaN(contentY)) {
              try {
                doc.text(name, nameX, contentY);
              } catch (error) {
                console.error("Error drawing item name:", error, { nameX, contentY, name });
              }
            }
            
            if (!isNaN(costX) && !isNaN(contentY)) {
              try {
                doc.text(cost, costX, contentY);
              } catch (error) {
                console.error("Error drawing item cost:", error, { costX, contentY, cost });
              }
            }
            
            doc.y = rowY + rowHeight;
          } catch (error) {
            console.error("Error rendering table row:", error, item);
            // Continue with next item
            doc.y += 20; // Move down to avoid overlapping
          }
        });
        
        doc.moveDown(0.5);
      } catch (tableError) {
        console.error("Fatal error creating fee table:", tableError);
        // Try to recover and continue
        doc.font('Helvetica-Bold').fontSize(10);
        try {
          doc.text(`${title} - Error displaying table`);
        } catch (e) {
          // Last resort
        }
        doc.moveDown();
      }
    };
    
    // Add Utilities table
    createFeeTable("Utilities Cost", Array.isArray(leaseData.utilities) ? 
      leaseData.utilities.filter(item => item && (item.selected === undefined || item.selected === true)) : 
      []);
    
    // Add Amenities table
    createFeeTable("Amenities Cost", Array.isArray(leaseData.amenities) ? 
      leaseData.amenities.filter(item => item && (item.selected === undefined || item.selected === true)) : 
      []);
    
    // Add Other Fees table
    createFeeTable("Other Fees", rentBreakdown.otherFees);
    
    // TOTAL MONTHLY RENT
    // Safely calculate total by ensuring all values are valid numbers
    const safeParseFloat = (val) => {
      if (val === undefined || val === null) return 0;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    const total = (
      safeParseFloat(rentBreakdown.baseRent) +
      safeParseFloat(rentBreakdown.utilities) +
      safeParseFloat(rentBreakdown.amenities) +
      (Array.isArray(rentBreakdown.otherFees) ? 
        rentBreakdown.otherFees.reduce((sum, fee) => sum + safeParseFloat(fee.amount), 0) : 0)
    );
    
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(11);
    try {
      doc.text("TOTAL MONTHLY RENT: ", { continued: true });
      doc.text(formatCurrency(total));
    } catch (error) {
      console.error("Error displaying total rent:", error);
      // Fallback
      doc.text(`TOTAL MONTHLY RENT: ${formatCurrency(total)}`);
    }
    doc.moveDown(0.5);
    
    // PAYMENT POLICIES
    checkForNewPage();
    doc.font('Helvetica-Bold').fontSize(10);
    safeText("PAYMENT POLICIES", { underline: true });
    doc.moveDown(0.3);
    
    addLineItem("Grace Period", terms.gracePeriod ? `${terms.gracePeriod} days` : "");
    addLineItem("Late Payment Policy", terms.latePaymentPolicy || "");
    addLineItem("Notice Period", terms.noticePeriod ? `${terms.noticePeriod} days` : "");
    addLineItem("Renewal Terms", terms.renewalTerms || "");
    doc.moveDown(0.5);
    
    // RULES & REGULATIONS
    checkForNewPage();
    doc.font('Helvetica-Bold').fontSize(10);
    safeText("RULES AND REGULATIONS", { underline: true });
    doc.moveDown(0.3);
    
    if (terms.rulesAndRegulations) {
      doc.font('Helvetica').fontSize(9);
      safeText(terms.rulesAndRegulations, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: 'left', 
        paragraphGap: 5
      });
    } else {
      doc.font('Helvetica');
      safeText("No specific rules and regulations provided.");
    }
    doc.moveDown(0.5);
    
    // TERMS & CONDITIONS
    checkForNewPage();
    doc.font('Helvetica-Bold').fontSize(10);
    safeText("TERMS AND CONDITIONS", { underline: true });
    doc.moveDown(0.3);
    
    if (terms.customTermsAndConditions) {
      doc.font('Helvetica').fontSize(9);
      safeText(terms.customTermsAndConditions, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: 'left',
        paragraphGap: 5
      });
    } else {
      doc.font('Helvetica');
      safeText("No specific terms and conditions provided.");
    }
    doc.moveDown(0.5);
    
    // SIGNATURES
    checkForNewPage(150);
    doc.font('Helvetica-Bold').fontSize(10);
    safeText("SIGNATURES", { underline: true });
    doc.moveDown(0.5);
    
    // Landlord signature
    doc.font('Helvetica-Bold');
    safeText("Landlord Signature:");
    const signatureLine = "______________________________";
    
    if (leaseData.uploadedOwnerSignature?.data?.data) {
      try {
        // Safe buffer conversion with error handling
        const signatureBuffer = Buffer.isBuffer(leaseData.uploadedOwnerSignature.data.data) 
          ? leaseData.uploadedOwnerSignature.data.data 
          : Buffer.from(leaseData.uploadedOwnerSignature.data.data);
        
        // Draw signature with safe options
        doc.image(signatureBuffer, {
          width: 150,
          height: 50,
          align: 'left',
          valign: 'center'
        });
      } catch (error) {
        console.error("Error adding landlord signature to PDF:", error);
        safeText(signatureLine);
      }
    } else {
      safeText(signatureLine);
    }
    
    doc.moveDown(0.2);
    doc.font('Helvetica');
    safeText(`Date: ${leaseData.isSignedByLandlord ? formatDate(new Date()) : "________________"}`);
    doc.moveDown(0.5);
    
    // Tenant signature
    doc.font('Helvetica-Bold');
    safeText("Tenant Signature:");
    
    if (leaseData.uploadedSignature?.data?.data) {
      try {
        // Safe buffer conversion with error handling
        const signatureBuffer = Buffer.isBuffer(leaseData.uploadedSignature.data.data) 
          ? leaseData.uploadedSignature.data.data 
          : Buffer.from(leaseData.uploadedSignature.data.data);
        
        // Draw signature with safe options
        doc.image(signatureBuffer, {
          width: 150,
          height: 50,
          align: 'left',
          valign: 'center'
        });
      } catch (error) {
        console.error("Error adding tenant signature to PDF:", error);
        safeText(signatureLine);
      }
    } else {
      safeText(signatureLine);
    }
    
    doc.moveDown(0.2);
    doc.font('Helvetica');
    safeText(`Date: ${leaseData.isSignedBySeeker ? formatDate(new Date()) : "________________"}`);
    
    // Add a footer with page numbers
    try {
      const totalPages = doc.bufferedPageRange().count;
      
      // Apply page numbers to all pages
      for (let i = 0; i < totalPages; i++) {
        try {
          doc.switchToPage(i);
          
          // Safe property name
          const propertyName = (leaseData.property?.name || 'Property').trim();
          
          // Calculate safe positions
          const footerY = Math.min(doc.page.height - 30, doc.page.height - doc.page.margins.bottom + 15);
          const footerX = Math.max(50, doc.page.margins.left);
          const footerWidth = Math.max(100, doc.page.width - 100);
          
          // Ensure all values are valid numbers
          if (isNaN(footerX) || isNaN(footerY) || isNaN(footerWidth)) {
            console.error("Invalid footer coordinates:", { footerX, footerY, footerWidth });
            continue;
          }
          
          // Draw footer with safe values
          doc.fontSize(8);
          doc.font('Helvetica');
          try {
            doc.text(
              `Page ${i + 1} of ${totalPages} | ${propertyName}`,
              footerX,
              footerY,
              { 
                align: 'center', 
                width: footerWidth,
                lineBreak: false
              }
            );
          } catch (error) {
            console.error(`Error adding footer text to page ${i}:`, error);
          }
        } catch (error) {
          console.error(`Error adding footer to page ${i}:`, error);
          // Continue with next page on error
        }
      }
    } catch (footerError) {
      console.error("Error adding page footers:", footerError);
    }

    // Finalize the PDF and end the stream
    doc.end();
    return stream;
  } catch (error) {
    console.error("Fatal error in PDF generation:", error);
    // Create a simple error PDF instead
    const errorDoc = new PDFDocument({size: 'A4'});
    const errorStream = new PassThrough();
    errorDoc.pipe(errorStream);
    
    errorDoc.fontSize(16).text('Error Generating PDF', {align: 'center'});
    errorDoc.moveDown();
    errorDoc.fontSize(12).text('There was an error generating this lease document.', {align: 'center'});
    errorDoc.moveDown();
    errorDoc.fontSize(10).text('Please try again or contact support if this problem persists.', {align: 'center'});
    
    errorDoc.end();
    return errorStream;
  }
};

export default generatePdf;
