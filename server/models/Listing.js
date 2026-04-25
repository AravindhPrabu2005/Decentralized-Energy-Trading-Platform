const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema({
  prosumerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prosumer', required: true },
  prosumerName: { type: String },
  energySource: { type: String, enum: ['Solar', 'Wind', 'Hydro', 'Biomass'], default: 'Solar' },
  quantity: { type: Number, required: true },        // kWh available
  remainingQty: { type: Number },                    // decrements after each auction
  pricePerUnit: { type: Number, required: true },    // ₹ per kWh (ask price)
  minPricePerUnit: { type: Number, required: true }, // floor — won't sell below this
  location: { type: String },
  availableFrom: { type: Date, default: Date.now },
  availableTo: { type: Date },
  status: {
    type: String,
    enum: ['active', 'partially_filled', 'fulfilled', 'cancelled', 'expired'],
    default: 'active'
  },
  totalEarned: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Listing', listingSchema)