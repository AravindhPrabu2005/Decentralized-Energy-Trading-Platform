const Listing = require('../models/Listing')
const Bid     = require('../models/Bid')
const Trade   = require('../models/Trade')
const Prosumer = require('../models/Prosumer')
const Consumer = require('../models/Consumer')

let auctionRound = 0

async function runAuction(io) {
  try {
    auctionRound++
    console.log(`\n⚡ Auction Round #${auctionRound} starting...`)

    // ── 1. Fetch active listings & bids ──────────────────────────
    const listings = await Listing.find({ status: { $in: ['active', 'partially_filled'] } })
    const bids     = await Bid.find({ status: { $in: ['pending', 'partially_filled'] } })

    if (listings.length === 0 || bids.length === 0) {
      console.log('⚠️  No listings or bids to match.')
      io.emit('auction:cleared', { round: auctionRound, trades: [], message: 'No matches this round' })
      return
    }

    // ── 2. Flatten into unit-level ask/bid arrays ─────────────────
    // Each entry represents 1 kWh unit with a price
    const asks = []
    listings.forEach(l => {
      for (let i = 0; i < l.remainingQty; i++) {
        asks.push({
          price: l.pricePerUnit,
          minPrice: l.minPricePerUnit,
          listingId: l._id,
          prosumerId: l.prosumerId,
          energySource: l.energySource,
        })
      }
    })

    const bidsFlat = []
    bids.forEach(b => {
      for (let i = 0; i < b.remainingQty; i++) {
        bidsFlat.push({
          price: b.pricePerUnit,
          bidId: b._id,
          consumerId: b.consumerId,
        })
      }
    })

    // ── 3. Sort: asks ASC, bids DESC ──────────────────────────────
    asks.sort((a, b) => a.price - b.price)
    bidsFlat.sort((a, b) => b.price - a.price)

    // ── 4. McAfee Double Auction ───────────────────────────────────
    let k = 0
    while (
      k < asks.length &&
      k < bidsFlat.length &&
      bidsFlat[k].price >= asks[k].price &&
      bidsFlat[k].price >= asks[k].minPrice   // respect prosumer's floor
    ) k++

    if (k === 0) {
      console.log('❌ No profitable matches this round')
      io.emit('auction:cleared', { round: auctionRound, trades: [], message: 'No matches — bid prices too low' })
      return
    }

    // Determine clearing price per unit
    let matchedUnits = k
    let clearingPrice

    if (k < asks.length && k < bidsFlat.length) {
      // Case I — trade exactly k units at midpoint of the k+1 th pair
      clearingPrice = (bidsFlat[k].price + asks[k].price) / 2
    } else {
      // Case II — trade reduction: k-1 units
      matchedUnits = k - 1
      if (matchedUnits === 0) {
        io.emit('auction:cleared', { round: auctionRound, trades: [], message: 'Trade reduction — no match' })
        return
      }
      clearingPrice = (bidsFlat[k - 1].price + asks[k - 1].price) / 2
    }

    // ── 5. Group matched units back into Trade records ────────────
    // Aggregate: group by (listingId, bidId) pair for efficiency
    const tradeMap = new Map()
    for (let i = 0; i < matchedUnits; i++) {
      const ask = asks[i]
      const bid = bidsFlat[i]
      const key = `${ask.listingId}_${bid.bidId}`
      if (tradeMap.has(key)) {
        tradeMap.get(key).quantity++
      } else {
        tradeMap.set(key, {
          listingId:    ask.listingId,
          bidId:        bid.bidId,
          prosumerId:   ask.prosumerId,
          consumerId:   bid.consumerId,
          quantity:     1,
          askPrice:     ask.price,
          bidPrice:     bid.price,
          clearingPrice,
          energySource: ask.energySource,
          auctionRound,
        })
      }
    }

    // ── 6. Persist trades & update listing/bid quantities ─────────
    const createdTrades = []
    const listingUpdates = new Map()   // listingId → qty deducted
    const bidUpdates     = new Map()   // bidId     → qty deducted

    for (const [, t] of tradeMap) {
      t.totalAmount = +(t.clearingPrice * t.quantity).toFixed(2)

      const trade = await Trade.create(t)
      createdTrades.push(trade)

      // Track deductions
      listingUpdates.set(String(t.listingId), (listingUpdates.get(String(t.listingId)) || 0) + t.quantity)
      bidUpdates.set(String(t.bidId),         (bidUpdates.get(String(t.bidId))         || 0) + t.quantity)
    }

    // Update Listings
    for (const [lid, qty] of listingUpdates) {
      const listing = await Listing.findById(lid)
      listing.remainingQty  -= qty
      listing.totalEarned   += +(clearingPrice * qty).toFixed(2)
      listing.status = listing.remainingQty <= 0 ? 'fulfilled' : 'partially_filled'
      await listing.save()

      // Update Prosumer stats
      await Prosumer.findByIdAndUpdate(listing.prosumerId, {
        $inc: { totalEnergySold: qty, totalEarnings: +(clearingPrice * qty).toFixed(2) }
      })
    }

    // Update Bids
    for (const [bid, qty] of bidUpdates) {
      const bidDoc = await Bid.findById(bid)
      bidDoc.remainingQty -= qty
      bidDoc.totalPaid    += +(clearingPrice * qty).toFixed(2)
      bidDoc.status = bidDoc.remainingQty <= 0 ? 'matched' : 'partially_filled'
      await bidDoc.save()
    }

    // ── 7. Emit socket events ─────────────────────────────────────
    const summary = {
      round: auctionRound,
      clearingPrice: +clearingPrice.toFixed(2),
      totalMatched: matchedUnits,
      totalTrades: createdTrades.length,
      trades: createdTrades,
    }

    // Broadcast to all — market stats update
    io.emit('auction:cleared', summary)

    // Notify each matched user individually
    for (const trade of createdTrades) {
      io.to(`user_${trade.prosumerId}`).emit('trade:matched', {
        role: 'prosumer', trade,
        message: `✅ ${trade.quantity} kWh sold at ₹${trade.clearingPrice}/kWh`
      })
      io.to(`user_${trade.consumerId}`).emit('trade:matched', {
        role: 'consumer', trade,
        message: `✅ ${trade.quantity} kWh purchased at ₹${trade.clearingPrice}/kWh`
      })
    }

    console.log(`✅ Round #${auctionRound}: ${matchedUnits} units matched at ₹${clearingPrice.toFixed(2)}/kWh`)
    return summary

  } catch (err) {
    console.error('❌ Auction engine error:', err)
  }
}

module.exports = { runAuction }