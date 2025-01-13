import RentDate from "./rentdates.model.js";

const getNextPeriodDate = (date, frequency) => {
  const newDate = new Date(date);
  switch (frequency.toLowerCase()) {
    case 'monthly':
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    case 'quarterly':
      newDate.setMonth(newDate.getMonth() + 3);
      break;
    case 'yearly':
      newDate.setFullYear(newDate.getFullYear() + 1);
      break;
    default:
      throw new Error('Invalid payment frequency');
  }
  return newDate;
};

const isPartialPeriod = (currentDate, endDate, frequency) => {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  switch(frequency.toLowerCase()) {
    case 'monthly':
      return currentDate.getDate() !== 1 || endDate.getDate() !== monthEnd.getDate();
    case 'quarterly':
      return (endDate - currentDate) / (1000 * 60 * 60 * 24) !== 91;
    case 'yearly':
      return (endDate - currentDate) / (1000 * 60 * 60 * 24) !== 365;
    default:
      return false;
  }
};

const calculatePartialPeriodRent = (startDate, endDate, amount, frequency) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Get total days in the month
  const totalDaysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  
  // Calculate actual days in the period
  const actualDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  // Calculate daily rate
  const dailyRate = amount / totalDaysInMonth;
  
  // Calculate prorated amount
  const proratedAmount = Math.round(dailyRate * actualDays * 100) / 100;
  
  return {
    days: actualDays,
    amount: proratedAmount
  };
};

export const generateRentDates = async (req, res) => {
  try {
    const { leaseId, moveInDate, moveOutDate, rentAmount, paymentFrequency } = req.body;

    if (!leaseId || !moveInDate || !moveOutDate || !rentAmount || !paymentFrequency) {
      throw new Error('Missing required fields for generating rent dates');
    }

    // Delete any existing rent dates for this lease
    await RentDate.deleteMany({ leaseId });

    const rentDates = [];
    let currentDate = new Date(moveInDate);
    const endDate = new Date(moveOutDate);

    while (currentDate <= endDate) {
      let periodEndDate = getNextPeriodDate(currentDate, paymentFrequency);
      periodEndDate = new Date(periodEndDate.setDate(periodEndDate.getDate() - 1));
      
      if (periodEndDate > endDate) {
        periodEndDate = new Date(endDate);
      }

      const rentDateData = {
        leaseId,
        rentDate: new Date(currentDate),
        dueDate: new Date(currentDate),
        endDate: periodEndDate,
        baseAmount: rentAmount,
        isPartialMonth: isPartialPeriod(currentDate, periodEndDate, paymentFrequency),
        numberOfDays: Math.ceil((periodEndDate - currentDate) / (1000 * 60 * 60 * 24)) + 1
      };

      // Check if this is a partial period
      if (
        currentDate.getMonth() !== periodEndDate.getMonth() ||
        currentDate.getFullYear() !== periodEndDate.getFullYear()
      ) {
        const partial = calculatePartialPeriodRent(
          currentDate, 
          periodEndDate, 
          rentAmount, 
          paymentFrequency
        );
        rentDateData.isPartialMonth = true;
        rentDateData.numberOfDays = partial.days;
        rentDateData.baseAmount = partial.amount;
      }

      rentDates.push(rentDateData);

      if (periodEndDate >= endDate) break;
      currentDate = new Date(periodEndDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const savedRentDates = await RentDate.insertMany(rentDates);
    
    if (res.status && res.json) {
      res.status(201).json(savedRentDates);
    }
    return savedRentDates;

  } catch (error) {
    console.error("Error generating rent dates:", error);
    if (res.status && res.json) {
      res.status(400).json({ message: error.message });
    }
    throw error;
  }
};


export const getRentDatesByLease = async (req, res) => {
  try {
    const { leaseId } = req.params;
    const rentDates = await RentDate.find({ leaseId })
      .populate('payment')
      .sort('rentDate');
    res.status(200).json(rentDates);
  } catch (error) {
    res.status(500).json({ message: `Error fetching rent dates: ${error.message}` });
  }
};

export const updateRentDatePayment = async (req, res) => {
  try {
    const { rentDateId, paymentId } = req.body;

    if (!rentDateId || !paymentId) {
      return res.status(400).json({ 
        message: "Both rentDateId and paymentId are required" 
      });
    }

    const updatedRentDate = await RentDate.findByIdAndUpdate(
      rentDateId,
      {
        payment: paymentId,
        status: "Paid"
      },
      { new: true }
    );
    
    if (!updatedRentDate) {
      return res.status(404).json({ message: "Rent date not found" });
    }
    
    res.status(200).json(updatedRentDate);
  } catch (error) {
    res.status(400).json({ message: `Error updating rent date payment: ${error.message}` });
  }
};
