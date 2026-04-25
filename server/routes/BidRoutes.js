const express = require('express')
const router  = express.Router()
const Bid     = require('../models/Bid')
const { getIO } = require('../socket')

// POST /bids — Consumer places a bid
router.post('/', async (req, res) => {
  try {
    const { consumerId, consumerName, quantity,
            pricePerUnit, preferredSource, expiresAt } = req.body

    const bid = await Bid.create({
      consumerId, consumerName,
      quantity, remainingQty: quantity,
      pricePerUnit, preferredSource,
      expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h default
    })

    getIO().emit('bid:placed', bid)
    res.status(201).json({ success: true, bid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /bids/my/:consumerId — Consumer's own bids
router.get('/my/:consumerId', async (req, res) => {
  try {
    const bids = await Bid.find({ consumerId: req.params.consumerId })
      .sort({ createdAt: -1 })
    res.json({ success: true, bids })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /bids/:id — Cancel bid
router.delete('/:id', async (req, res) => {
  try {
    await Bid.findByIdAndUpdate(req.params.id, { status: 'cancelled' })
    res.json({ success: true, message: 'Bid cancelled' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router