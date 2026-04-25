const mongoose = require('mongoose')

const bidSchema = new mongoose.Schema({
  consumerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer', required: true },
  consumerName: { type: String },
  quantity: { type: Number, required: true },       // kWh wanted
  remainingQty: { type: Number },                   // decrements after partial fills
  pricePerUnit: { type: Number, required: true },   // max ₹ willing to pay
  preferredSource: {
    type: String,
    enum: ['Solar', 'Wind', 'Hydro', 'Biomass', 'Any'],
    default: 'Any'
  },
  status: {
    type: String,
    enum: ['pending', 'partially_filled', 'matched', 'cancelled', 'expired'],
    default: 'pending'
  },
  expiresAt: { type: Date },
  totalPaid: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Bid', bidSchema)