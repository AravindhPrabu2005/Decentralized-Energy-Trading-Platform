const express = require('express')
const router  = express.Router()
const Trade   = require('../models/Trade')

// GET /trades/prosumer/:id — Prosumer's settled trades
router.get('/prosumer/:id', async (req, res) => {
  try {
    const trades = await Trade.find({ prosumerId: req.params.id })
      .sort({ createdAt: -1 })
    res.json({ success: true, trades })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /trades/consumer/:id — Consumer's settled trades
router.get('/consumer/:id', async (req, res) => {
  try {
    const trades = await Trade.find({ consumerId: req.params.id })
      .sort({ createdAt: -1 })
    res.json({ success: true, trades })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /trades/market — Latest 20 trades for live market feed
router.get('/market', async (req, res) => {
  try {
    const trades = await Trade.find({ status: 'matched' })
      .sort({ createdAt: -1 }).limit(20)
    res.json({ success: true, trades })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router