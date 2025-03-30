export const calculatePeriodPrice = (basePrice, rentPeriod) => {
    switch(rentPeriod) {
      case 'day':
      case 'night':
        return basePrice;
      case 'week':
        return basePrice * 7;
      case 'month':
        return basePrice;
      case 'quarter':
        return basePrice * 3;
      case 'year':
        return basePrice * 12;
      default:
        return basePrice;
    }
  };
  
  export const calculateTotalPrice = (listing, numberOfPeople = 1) => {
    if (listing.priceType === 'total') return listing.price;
    const periodPrice = calculatePeriodPrice(listing.price, listing.rentPeriod);
    return periodPrice * numberOfPeople;
  };