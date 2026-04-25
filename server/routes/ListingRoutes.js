const express = require('express')
const router  = express.Router()
const Listing = require('../models/Listing')
const { getIO } = require('../socket')

// POST /listings — Prosumer creates a listing
router.post('/', async (req, res) => {
  try {
    const { prosumerId, prosumerName, energySource, quantity,
            pricePerUnit, minPricePerUnit, location, availableTo } = req.body

    const listing = await Listing.create({
      prosumerId, prosumerName, energySource,
      quantity, remainingQty: quantity,
      pricePerUnit, minPricePerUnit,
      location, availableTo
    })

    // Broadcast new listing to all connected clients
    getIO().emit('listing:new', listing)
    res.status(201).json({ success: true, listing })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /listings — All active listings (for marketplace)
router.get('/', async (req, res) => {
  try {
    const { source, minPrice, maxPrice, minQty } = req.query
    const filter = { status: { $in: ['active', 'partially_filled'] } }
    if (source)   filter.energySource = source
    if (minPrice) filter.pricePerUnit = { ...filter.pricePerUnit, $gte: +minPrice }
    if (maxPrice) filter.pricePerUnit = { ...filter.pricePerUnit, $lte: +maxPrice }
    if (minQty)   filter.remainingQty = { $gte: +minQty }

    const listings = await Listing.find(filter).sort({ pricePerUnit: 1 })
    res.json({ success: true, listings })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /listings/my/:prosumerId — Prosumer's own listings
router.get('/my/:prosumerId', async (req, res) => {
  try {
    const listings = await Listing.find({ prosumerId: req.params.prosumerId })
      .sort({ createdAt: -1 })
    res.json({ success: true, listings })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /listings/:id — Update listing price/qty
router.put('/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true })
    getIO().emit('listing:updated', listing)
    res.json({ success: true, listing })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /listings/:id — Cancel listing
router.delete('/:id', async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, { status: 'cancelled' })
    res.json({ success: true, message: 'Listing cancelled' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router