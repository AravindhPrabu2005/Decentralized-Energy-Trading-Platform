const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const prosumerSchema = new mongoose.Schema({
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

  // Prosumer Specific Details
  prosumerId: {
    type: String,
    unique: true
  },
  accountType: {
    type: String,
    default: 'Solar Prosumer'
  },

  // Energy System Details
  energySource: {
    type: String,
    required: true,
    enum: ['Solar Panels', 'Wind Turbine', 'Hydro Power', 'Biomass']
  },
  systemCapacity: {
    type: Number,
    required: true
  },
  installationDate: {
    type: Date,
    required: true
  },
  panelBrand: {
    type: String,
    default: ''
  },
  inverterBrand: {
    type: String,
    default: ''
  },
  batteryCapacity: {
    type: Number
  },
  batteryBrand: {
    type: String,
    default: ''
  },
  meterNumber: {
    type: String,
    required: true,
    unique: true
  },
  gridConnectionType: {
    type: String,
    required: true,
    enum: ['Bi-directional', 'Single-directional', 'Off-grid']
  },

  // Wallet
  walletBalance: {
    type: Number,
    default: 0
  },

  // Production & Sales Statistics
  totalEnergyProduced: {
    type: Number,
    default: 0
  },
  totalEnergySold: {
    type: Number,
    default: 0
  },
  totalEnergyPurchased: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalSpending: {
    type: Number,
    default: 0
  },

  // Ratings & Reviews
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalTransactions: {
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

// Auto-generate Prosumer ID (race-condition safe)
prosumerSchema.pre('save', async function (next) {
  if (!this.prosumerId) {
    const counter = await Counter.findOneAndUpdate(
      { name: 'prosumer' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.prosumerId = `PROS-${new Date().getFullYear()}-${String(counter.seq).padStart(5, '0')}`;
  }
  next();
});

// Hash password before saving
prosumerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('Prosumer', prosumerSchema);