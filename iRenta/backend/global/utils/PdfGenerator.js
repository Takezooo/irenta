import PDFDocument from "pdfkit";
import { PassThrough } from 'stream';

const generatePdf = async (leaseData, tenant) => {
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
  
  // Pipe the PDF document to the PassThrough stream
  doc.pipe(stream);
  
  // Helper function to check if we need a new page
  const checkForNewPage = (neededHeight = 100) => {
    if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      return true;
    }
    return false;
  };
  
  // Helper function to add a simple label-value pair
  const addLineItem = (label, value, options = {}) => {
    doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
    doc.font('Helvetica').text(value || "", options);
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
    if (amount === undefined || amount === null) return "";
    return `₱${parseFloat(amount).toFixed(2)}`;
  };

  // TITLE AND REFERENCE
  doc.font('Helvetica-Bold').fontSize(14).text("RESIDENTIAL LEASE AGREEMENT", { align: "center" });
  doc.moveDown(0.5);
  
  doc.fontSize(8).font('Helvetica').text(`Reference #: ${leaseData._id || ""}`, { align: "right" });
  doc.text(`Date: ${formatDate(new Date())}`, { align: "right" });
  doc.moveDown(0.5);
  
  // PROPERTY INFORMATION
  doc.font('Helvetica-Bold').fontSize(10).text("PROPERTY INFORMATION", { underline: true });
  doc.moveDown(0.3);
  
  const address = leaseData.property.address;
  let fullAddress = "";
  if (address) {
    const parts = [
      address.houseNumber,
      address.street,
      address.city,
      address.zip
    ].filter(Boolean);
    fullAddress = parts.join(", ");
  }
  
  addLineItem("Property Name", leaseData.property.name);
  addLineItem("Property Address", fullAddress);
  doc.moveDown(0.5);
  
  // PARTIES
  doc.font('Helvetica-Bold').fontSize(10).text("PARTIES", { underline: true });
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
  doc.font('Helvetica-Bold').fontSize(10).text("LEASE TERMS", { underline: true });
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
  doc.font('Helvetica-Bold').fontSize(10).text("FINANCIAL DETAILS", { underline: true });
  doc.moveDown(0.3);
  
  // Base rent and deposit
  const rentBreakdown = leaseData.contractDetails?.rentBreakdown || {};
  addLineItem("Base Rent", formatCurrency(rentBreakdown.baseRent));
  addLineItem("Deposit Amount", formatCurrency(terms.depositAmount));
  addLineItem("Payment Frequency", terms.paymentFrequency || "");
  doc.moveDown(0.5);
  
  // Function to create clean fee tables like in the screenshot
  const createFeeTable = (title, items, tablePadding = 10) => {
    // Check if items is undefined or null before trying to access length
    if (!items || !Array.isArray(items) || items.length === 0) {
      doc.font('Helvetica-Bold').fontSize(10).text(title);
      doc.moveDown(0.3);
      doc.font('Helvetica').text("N/A");
      doc.moveDown(0.5);
      return;
    }
    
    // Calculate needed height based on number of items
    const neededHeight = Math.min(items.length * 20 + 50, 150); // Cap at reasonable height
    
    if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }
    
    doc.font('Helvetica-Bold').fontSize(10).text(title);
    doc.moveDown(0.3);
    
    // Set up table dimensions
    const startX = doc.x;
    const colWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colDivide = 0.7; // 70% for item name, 30% for cost
    
    // Draw table headers
    doc.rect(startX, doc.y, colWidth, 20).fill("#f0f0f0");
    doc.fillColor("#000000");
    
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text("Item", startX + tablePadding, doc.y - 20 + tablePadding);
    doc.text("Cost", startX + (colWidth * colDivide) + tablePadding, doc.y - 20 + tablePadding);
    
    doc.y += 5; // Add spacing after header
    
    // Draw rows for each item
    items.forEach((item, index) => {
      // Check if we need a new page before adding this item
      if (doc.y + 20 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        // Re-establish table headers on the new page
        doc.rect(startX, doc.y, colWidth, 20).fill("#f0f0f0");
        doc.fillColor("#000000");
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text("Item", startX + tablePadding, doc.y + tablePadding);
        doc.text("Cost", startX + (colWidth * colDivide) + tablePadding, doc.y + tablePadding);
        doc.y += 20; // Space for header
      }
      
      const rowY = doc.y;
      const rowHeight = 20;
      
      // Draw row background (alternating colors)
      if (index % 2 === 0) {
        doc.rect(startX, rowY, colWidth, rowHeight).fill("#f9f9f9");
      } else {
        doc.rect(startX, rowY, colWidth, rowHeight).fill("#ffffff");
      }
      doc.fillColor("#000000");
      
      // Draw item name and cost
      const name = item.name || "";
      const cost = (item.amount !== undefined ? formatCurrency(item.amount) : "Included");
      
      doc.font('Helvetica').fontSize(9);
      doc.text(name, startX + tablePadding, rowY + tablePadding - 5);
      doc.text(cost, startX + (colWidth * colDivide) + tablePadding, rowY + tablePadding - 5);
      
      doc.y = rowY + rowHeight;
    });
    
    doc.moveDown(0.5);
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
  const total = (
    parseFloat(rentBreakdown.baseRent || 0) +
    parseFloat(rentBreakdown.utilities || 0) +
    parseFloat(rentBreakdown.amenities || 0) +
    (Array.isArray(rentBreakdown.otherFees) ? 
      rentBreakdown.otherFees.reduce((sum, fee) => sum + parseFloat(fee.amount || 0), 0) : 0)
  );
  
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold').fontSize(11).text("TOTAL MONTHLY RENT: ", { continued: true });
  doc.text(formatCurrency(total));
  doc.moveDown(0.5);
  
  // PAYMENT POLICIES
  checkForNewPage();
  doc.font('Helvetica-Bold').fontSize(10).text("PAYMENT POLICIES", { underline: true });
  doc.moveDown(0.3);
  
  addLineItem("Grace Period", terms.gracePeriod ? `${terms.gracePeriod} days` : "");
  addLineItem("Late Payment Policy", terms.latePaymentPolicy || "");
  addLineItem("Notice Period", terms.noticePeriod ? `${terms.noticePeriod} days` : "");
  addLineItem("Renewal Terms", terms.renewalTerms || "");
  doc.moveDown(0.5);
  
  // RULES & REGULATIONS
  checkForNewPage();
  doc.font('Helvetica-Bold').fontSize(10).text("RULES AND REGULATIONS", { underline: true });
  doc.moveDown(0.3);
  
  if (terms.rulesAndRegulations) {
    doc.font('Helvetica').fontSize(9).text(terms.rulesAndRegulations, {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
      align: 'left', 
      paragraphGap: 5
    });
  } else {
    doc.font('Helvetica').text("No specific rules and regulations provided.");
  }
  doc.moveDown(0.5);
  
  // TERMS & CONDITIONS
  checkForNewPage();
  doc.font('Helvetica-Bold').fontSize(10).text("TERMS AND CONDITIONS", { underline: true });
  doc.moveDown(0.3);
  
  if (terms.customTermsAndConditions) {
    doc.font('Helvetica').fontSize(9).text(terms.customTermsAndConditions, {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
      align: 'left',
      paragraphGap: 5
    });
  } else {
    doc.font('Helvetica').text("No specific terms and conditions provided.");
  }
  doc.moveDown(0.5);
  
  // SIGNATURES
  checkForNewPage(150);
  doc.font('Helvetica-Bold').fontSize(10).text("SIGNATURES", { underline: true });
  doc.moveDown(0.5);
  
  // Landlord signature
  doc.font('Helvetica-Bold').text("Landlord Signature:");
  const signatureLine = "______________________________";
  
  if (leaseData.uploadedOwnerSignature?.data?.data) {
    try {
      const signatureData = Buffer.from(leaseData.uploadedOwnerSignature.data.data);
      doc.image(signatureData, { width: 150, height: 50 });
    } catch (error) {
      console.error("Error adding landlord signature to PDF:", error);
      doc.text(signatureLine);
    }
  } else {
    doc.text(signatureLine);
  }
  
  doc.moveDown(0.2);
  doc.font('Helvetica').text(`Date: ${leaseData.isSignedByLandlord ? formatDate(new Date()) : "________________"}`);
  doc.moveDown(0.5);
  
  // Tenant signature
  doc.font('Helvetica-Bold').text("Tenant Signature:");
  
  if (leaseData.uploadedSignature?.data?.data) {
    try {
      const signatureData = Buffer.from(leaseData.uploadedSignature.data.data);
      doc.image(signatureData, { width: 150, height: 50 });
    } catch (error) {
      console.error("Error adding tenant signature to PDF:", error);
      doc.text(signatureLine);
    }
  } else {
    doc.text(signatureLine);
  }
  
  doc.moveDown(0.2);
  doc.font('Helvetica').text(`Date: ${leaseData.isSignedBySeeker ? formatDate(new Date()) : "________________"}`);
  
  // Add a footer with page numbers
  doc.on('pageAdded', () => {
    const totalPages = doc.bufferedPageRange().count;
    const currentPage = doc.bufferedPageRange().start + doc.bufferedPageRange().count;
    
    // Save the state before adding footer
    doc.save();
    doc.fontSize(8);
    doc.font('Helvetica');
    doc.text(
      `Page ${currentPage} of ${totalPages} | ${leaseData.property?.name || 'Property'}`,
      50,
      doc.page.height - 50,
      { align: 'center', width: doc.page.width - 100 }
    );
    // Restore the state
    doc.restore();
  });

  // Finalize the PDF and end the stream
  doc.end();
  return stream;
};

export default generatePdf;
