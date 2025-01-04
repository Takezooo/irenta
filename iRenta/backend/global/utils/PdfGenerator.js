import PDFDocument from "pdfkit";

const generatePdf = async (leaseData, tenant) => {
  const doc = new PDFDocument();

  // Generate the PDF content
  doc.fontSize(20).text("Lease Agreement", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Property Name: ${leaseData.property.name}`);
  doc.text(`Landlord: ${leaseData.landlordName}`);
  {
    tenant === null
      ? doc.text(`Tenant: ${leaseData.tenantPlaceholder.name}`)
      : doc.text(`Tenant: ${tenant.firstName} ${tenant.lastName}`);
  }
  doc.text(`Start Date: ${leaseData.contractDetails.startDate}`);
  doc.text(`End Date: ${leaseData.contractDetails.endDate}`);
  doc.text(`Rent Amount: ${leaseData.contractDetails.rentAmount}`);
  doc.text(`Deposit Amount: ${leaseData.contractDetails.depositAmount}`);
  doc.text(
    `Payment Frequency: ${leaseData.contractDetails.paymentFrequency}`
  );
  doc.moveDown();
  doc.text(
    `Terms and Conditions:\n${leaseData.contractDetails.customTermsAndConditions}`
  );
  doc.text(
    `Rules and Regulations:\n${leaseData.contractDetails.rulesAndRegulations}`
  );

  return doc;
};

export default generatePdf;
