const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Consumer = require('../models/Consumer');
const Prosumer = require('../models/Prosumer');
const { upload } = require('../config/cloudinary');

// Generate JWT Token
const generateToken = (user, userType) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      userType: userType
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// =====================
// TEST ROUTE
// =====================
router.get('/testauth', (req, res) => {
  res.send("Auth route is working!");
});

// =====================
// CONSUMER REGISTRATION
// =====================
router.post('/consumer/register', upload.single('profilePicture'), async (req, res) => {
  try {
    const {
      name, email, password, phone,
      address, city, state, pincode,
      meterNumber, connectionType, energyCapacity
    } = req.body;

    if (!name || !email || !password || !phone || !address || !city || !state || !pincode || !meterNumber) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const existingConsumer = await Consumer.findOne({ email });
    if (existingConsumer) {
      return res.status(400).json({ error: 'Email already registered as consumer' });
    }

    const existingProsumer = await Prosumer.findOne({ email });
    if (existingProsumer) {
      return res.status(400).json({ error: 'Email already registered as prosumer' });
    }

    const existingMeter = await Consumer.findOne({ meterNumber });
    if (existingMeter) {
      return res.status(400).json({ error: 'Meter number already registered' });
    }

    const consumer = new Consumer({
      name,
      email,
      password,
      phone,
      address,
      city,
      state,
      pincode,
      meterNumber,
      connectionType: connectionType || 'Single Phase',
      energyCapacity: energyCapacity || '5 kW',
      // ✅ Store Cloudinary URL if uploaded, else null
      profilePicture: req.file ? req.file.path : null
    });

    await consumer.save();

    const token = generateToken(consumer, 'consumer');

    res.status(201).json({
      success: true,
      message: 'Consumer registered successfully',
      token,
      user: {
        id: consumer._id,
        name: consumer.name,
        email: consumer.email,
        consumerId: consumer.consumerId,
        userType: 'consumer',
        verificationStatus: consumer.verificationStatus,
        profilePicture: consumer.profilePicture
      }
    });
  } catch (error) {
    console.error('Consumer registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// =====================
// PROSUMER REGISTRATION
// =====================
router.post('/prosumer/register', upload.single('profilePicture'), async (req, res) => {
  try {
    const {
      name, email, password, phone,
      address, city, state, pincode,
      energySource, systemCapacity, installationDate,
      panelBrand, inverterBrand, batteryCapacity,
      batteryBrand, meterNumber, gridConnectionType
    } = req.body;

    if (!name || !email || !password || !phone || !address || !city || !state || !pincode ||
        !energySource || !systemCapacity || !installationDate || !meterNumber || !gridConnectionType) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const existingProsumer = await Prosumer.findOne({ email });
    if (existingProsumer) {
      return res.status(400).json({ error: 'Email already registered as prosumer' });
    }

    const existingConsumer = await Consumer.findOne({ email });
    if (existingConsumer) {
      return res.status(400).json({ error: 'Email already registered as consumer' });
    }

    const existingMeter = await Prosumer.findOne({ meterNumber });
    if (existingMeter) {
      return res.status(400).json({ error: 'Meter number already registered' });
    }

    const prosumer = new Prosumer({
      name,
      email,
      password,
      phone,
      address,
      city,
      state,
      pincode,
      energySource,
      systemCapacity: parseFloat(systemCapacity),
      installationDate,
      panelBrand,
      inverterBrand,
      batteryCapacity:
        batteryCapacity !== '' && !isNaN(parseFloat(batteryCapacity))
          ? parseFloat(batteryCapacity)
          : undefined,
      batteryBrand,
      meterNumber,
      gridConnectionType,
      // ✅ Store Cloudinary URL if uploaded, else null
      profilePicture: req.file ? req.file.path : null
    });

    await prosumer.save();

    const token = generateToken(prosumer, 'prosumer');

    res.status(201).json({
      success: true,
      message: 'Prosumer registered successfully',
      token,
      user: {
        id: prosumer._id,
        name: prosumer.name,
        email: prosumer.email,
        prosumerId: prosumer.prosumerId,
        userType: 'prosumer',
        verificationStatus: prosumer.verificationStatus,
        profilePicture: prosumer.profilePicture
      }
    });
  } catch (error) {
    console.error('Prosumer registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// =====================
// UNIFIED LOGIN
// =====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [consumer, prosumer] = await Promise.all([
      Consumer.findOne({ email }),
      Prosumer.findOne({ email })
    ]);

    if (consumer) {
      const isPasswordValid = await bcrypt.compare(password, consumer.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
      const token = generateToken(consumer, 'consumer');
      return res.json({
        success: true,
        token,
        user: {
          id: consumer._id,
          name: consumer.name,
          email: consumer.email,
          consumerId: consumer.consumerId,
          userType: 'consumer',
          verificationStatus: consumer.verificationStatus,
          profilePicture: consumer.profilePicture,
          isLoggedIn: true
        }
      });
    }

    if (prosumer) {
      const isPasswordValid = await bcrypt.compare(password, prosumer.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
      const token = generateToken(prosumer, 'prosumer');
      return res.json({
        success: true,
        token,
        user: {
          id: prosumer._id,
          name: prosumer.name,
          email: prosumer.email,
          prosumerId: prosumer.prosumerId,
          userType: 'prosumer',
          verificationStatus: prosumer.verificationStatus,
          profilePicture: prosumer.profilePicture,
          isLoggedIn: true
        }
      });
    }

    return res.status(401).json({ success: false, error: 'Invalid email or password' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// =====================
// VERIFY TOKEN
// =====================
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.userType === 'consumer') {
      user = await Consumer.findById(decoded.id).select('-password');
    } else if (decoded.userType === 'prosumer') {
      user = await Prosumer.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        userType: decoded.userType
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// GET consumer profile
router.get('/consumer/profile/:id', async (req, res) => {
  try {
    const consumer = await Consumer.findById(req.params.id).select('-password');
    if (!consumer) return res.status(404).json({ error: 'Consumer not found' });
    res.json({ consumer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update consumer profile
router.put('/consumer/profile/:id', upload.single('profilePicture'), async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
    };
    if (req.file) updates.profilePicture = req.file.path; // Cloudinary URL

    const consumer = await Consumer.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!consumer) return res.status(404).json({ error: 'Consumer not found' });
    res.json({ consumer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET prosumer profile
router.get('/prosumer/profile/:id', async (req, res) => {
  try {
    const prosumer = await Prosumer.findById(req.params.id).select('-password');
    if (!prosumer) return res.status(404).json({ error: 'Prosumer not found' });
    res.json({ prosumer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update prosumer profile
router.put('/prosumer/profile/:id', upload.single('profilePicture'), async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      energySource: req.body.energySource,
      systemCapacity: parseFloat(req.body.systemCapacity),
      installationDate: req.body.installationDate,
      panelBrand: req.body.panelBrand,
      inverterBrand: req.body.inverterBrand,
      batteryCapacity: req.body.batteryCapacity ? parseFloat(req.body.batteryCapacity) : undefined,
      batteryBrand: req.body.batteryBrand,
    };
    if (req.file) updates.profilePicture = req.file.path;

    const prosumer = await Prosumer.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!prosumer) return res.status(404).json({ error: 'Prosumer not found' });
    res.json({ prosumer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;