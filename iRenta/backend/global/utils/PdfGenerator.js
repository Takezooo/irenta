import PDFDocument from "pdfkit";

const generatePdf = async (contractData) => {
  const doc = new PDFDocument();

  // Generate the PDF content
  doc.fontSize(20).text("Contract Details", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Property Name: ${contractData.property.name}`);
  doc.text(`Landlord: ${contractData.landlordName}`);
  doc.text(`Tenant: ${contractData.tenant}`);
  doc.text(`Start Date: ${contractData.contractDetails.startDate}`);
  doc.text(`End Date: ${contractData.contractDetails.endDate}`);
  doc.text(`Rent Amount: ${contractData.contractDetails.rentAmount}`);
  doc.text(`Deposit Amount: ${contractData.contractDetails.depositAmount}`);
  doc.text(`Payment Frequency: ${contractData.contractDetails.paymentFrequency}`);
  doc.moveDown();
  doc.text(
    `Terms and Conditions:\n${contractData.contractDetails.termsAndConditions}`
  );
  doc.text(
    `Rules and Regulations:\n${contractData.contractDetails.rulesAndRegulations}`
  );

  return doc;
};

export default generatePdf;
