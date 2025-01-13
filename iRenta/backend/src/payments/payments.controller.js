// backend/src/payments/payments.controller.js
import Payment from "./payments.model.js";
import RentDate from "../rentdates/rentdates.model.js";

const calculateToBePaid = (rentDate) => {
  if (rentDate.isPartialMonth) {
    const totalDays = new Date(rentDate.rentDate.getFullYear(), 
                              rentDate.rentDate.getMonth() + 1, 0).getDate();
    return (rentDate.baseAmount / totalDays) * rentDate.numberOfDays;
  }
  return rentDate.baseAmount;
};

// Fetch payments
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate(
      "tenantId",
      "seekerId propertyId leaseId"
    );
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments." });
  }
};

// Add a new payment
export const addPayment = async (req, res) => {
  try {
    // Get data from request body
    const {
      rentDateId,
      tenantId,
      paidAmount,
      paymentMethod,
      referenceNumber,
      remarks
    } = req.body;

    // Validate required fields
    if (!rentDateId || !tenantId || !paidAmount || !paymentMethod) {
      return res.status(400).json({ 
        message: "Missing required fields: rentDateId, tenantId, paidAmount, and paymentMethod are required" 
      });
    }

    // Find rent date
    const rentDate = await RentDate.findById(rentDateId);
    if (!rentDate) {
      return res.status(404).json({ message: 'Rent date not found' });
    }

    // Calculate amount to be paid
    const toBePaid = calculateToBePaid(rentDate);

    // Create new payment
    const payment = new Payment({
      rentDateId,
      tenantId,
      toBePaid,
      paidAmount,
      paymentMethod,
      referenceNumber,
      remarks,
      status: 'Pending' // Default status
    });

    // Save payment
    const savedPayment = await payment.save();

    // Update rent date status
    await RentDate.findByIdAndUpdate(rentDate._id, {
      status: 'Paid',
      payment: savedPayment._id
    });

    res.status(201).json(savedPayment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  const { paymentId, status } = req.body;

  if (!paymentId || !status) {
    return res
      .status(400)
      .json({ message: "Payment ID and status are required." });
  }

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    payment.status = status;
    payment.updatedAt = new Date();

    await payment.save();

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Failed to update payment status." });
  }
};
