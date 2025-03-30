import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	price: { type: Number, required: true },
	type: { type: String, required: true },
	bedroomNumber: { type: Number },
	bathroomNumber: { type: Number },
	propertySize: { type: String, required: true },
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	images: [
		{
			id: { type: String },
			name: { type: String },
			link: { type: String },
		},
	],
	address: {
		houseNumber: { type: String, required: true },
		street: { type: String, required: true },
		city: { type: String, required: true },
		zip: { type: String },
		lng: { type: Number },
		lat: { type: Number },
	},
	visitAvailability: {
		startTime: { type: String },
		endTime: { type: String },
	},
	amenities: [
		{
			name: { type: String, required: true },
			fee: { type: Number, default: 0 },
		},
	],
	termsAndConditionsId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "TermsAndConditions",
		required: false,
	},
	customTermsAndConditions: {
		type: String,
		required: false,
	},
	onHold: { type: Boolean, default: false },
	askForValidId: {
		type: Boolean,
		default: false,
		required: false,
	},
	vacantUnits: { type: Number, default: 0, required: true },
	createdAt: { type: Date, default: Date.now },
	// New fields added below
	utilitiesIncluded: {
		type: Boolean,
		default: false,
	},
	includedUtilities: {
		type: [String],
	},
	vacancyStatus: {
		type: String,
	},
	rentPeriod: {
		type: String,
		enum: ["day", "night", "week", "month", "quarter", "year"],
		default: "month", // Add default if needed
	},
	priceType: {
		type: String,
		enum: ["per_head", "total"],
		default: "per_head",
	}
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


listingSchema.virtual('calculatedPrice').get(function() {
  const basePrice = this.price;
  const rentPeriod = this.rentPeriod;
  
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
});

// Add instance method
listingSchema.methods.calculateTotalPrice = function(numberOfPeople = 1) {
  if (this.priceType === 'total') return this.price;
  return this.calculatedPrice * numberOfPeople;
};

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
