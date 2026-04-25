const mongoose = require('mongoose')

const tradeSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  bidId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Bid',     required: true },
  prosumerId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Prosumer', required: true },
  consumerId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Consumer', required: true },
  quantity:        { type: Number, required: true }, // kWh traded
  askPrice:        { type: Number, required: true }, // prosumer's ask
  bidPrice:        { type: Number, required: true }, // consumer's bid
  clearingPrice:   { type: Number, required: true }, // (ask + bid) / 2
  totalAmount:     { type: Number, required: true }, // clearingPrice × quantity
  energySource:    { type: String },
  status: {
    type: String,
    enum: ['matched', 'settled', 'disputed'],
    default: 'matched'
  },
  auctionRound:    { type: Number },                 // which auction cycle
}, { timestamps: true })

module.exports = mongoose.model('Trade', tradeSchema)