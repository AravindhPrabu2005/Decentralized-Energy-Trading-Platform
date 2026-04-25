const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const consumerSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },

  // Consumer Specific Details
  consumerId: {
    type: String,
    unique: true
  },
  accountType: {
    type: String,
    default: 'Residential Consumer'
  },
  meterNumber: {
    type: String,
    required: true,
    unique: true
  },
  connectionType: {
    type: String,
    enum: ['Single Phase', 'Three Phase'],
    default: 'Single Phase'
  },
  energyCapacity: {
    type: String,
    default: '5 kW'
  },

  // Wallet
  walletBalance: {
    type: Number,
    default: 0
  },

  // Statistics
  totalEnergyPurchased: {
    type: Number,
    default: 0
  },
  totalSpending: {
    type: Number,
    default: 0
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },

  // Profile Picture
  profilePicture: {
    type: String,
    default: null
  },

  // Timestamps
  registeredDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-generate Consumer ID (race-condition safe)
consumerSchema.pre('save', async function (next) {
  if (!this.consumerId) {
    const counter = await Counter.findOneAndUpdate(
      { name: 'consumer' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.consumerId = `CONS-${new Date().getFullYear()}-${String(counter.seq).padStart(5, '0')}`;
  }
  next();
});

// Hash password before saving
consumerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('Consumer', consumerSchema);