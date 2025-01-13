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

const calculatePartialPeriodRent = (startDate, endDate, amount, frequency) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let totalDays;
  switch (frequency.toLowerCase()) {
    case 'monthly':
      totalDays = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      break;
    case 'quarterly':
      totalDays = 91;
      break;
    case 'yearly':
      totalDays = (start.getFullYear() % 4 === 0) ? 366 : 365;
      break;
    default:
      throw new Error('Invalid payment frequency');
  }
  
  const actualDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
  const dailyRate = amount / totalDays;
  
  return {
    days: Math.floor(actualDays),
    amount: Math.round(dailyRate * actualDays * 100) / 100
  };
};

export const generateRentDates = async (req, res) => {
  try {
    const { leaseId, moveInDate, moveOutDate, isFixed, rentAmount, paymentFrequency } = req.body;

    // Validate payment frequency
    const validFrequencies = ['monthly', 'quarterly', 'yearly'];
    if (!validFrequencies.includes(paymentFrequency.toLowerCase())) {
      return res.status(400).json({ 
        message: 'Invalid payment frequency. Must be monthly, quarterly, or yearly'
      });
    }

    const rentDates = [];
    let currentDate = new Date(moveInDate);
    const endDate = isFixed ? new Date(moveOutDate) : null;
    
    while (!endDate || currentDate <= endDate) {
      let periodEndDate = getNextPeriodDate(currentDate, paymentFrequency);
      periodEndDate = new Date(periodEndDate.setDate(periodEndDate.getDate() - 1));
      
      // Check if this is the last period and if it's partial
      const isLastPeriod = endDate && periodEndDate > endDate;
      if (isLastPeriod) {
        periodEndDate = endDate;
      }

      let rentDateData = {
        leaseId,
        rentDate: new Date(currentDate),
        dueDate: new Date(currentDate),
        endDate: periodEndDate,
        baseAmount: rentAmount,
        paymentFrequency,
      };

      // Calculate partial period if applicable
      if (isLastPeriod) {
        const partial = calculatePartialPeriodRent(
          currentDate, 
          periodEndDate, 
          rentAmount, 
          paymentFrequency
        );
        rentDateData = {
          ...rentDateData,
          isPartialMonth: true,
          numberOfDays: partial.days,
        };
      } else {
        rentDateData = {
          ...rentDateData,
          isPartialMonth: false,
        };
      }

      rentDates.push(rentDateData);

      if (isLastPeriod) break;
      
      currentDate = getNextPeriodDate(currentDate, paymentFrequency);
    }

    const savedRentDates = await RentDate.insertMany(rentDates);
    res.status(201).json(savedRentDates);
  } catch (error) {
    res.status(400).json({ message: `Error generating rent dates: ${error.message}` });
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
