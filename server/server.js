const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')
const http     = require('http')           // ← ADD
require('dotenv').config()

const dns = require('node:dns')
dns.setServers(['1.1.1.1', '8.8.8.8'])

const app    = express()
const server = http.createServer(app)       // ← wrap express in http

// ── Init Socket.IO ───────────────────────────────────────────
const { initSocket } = require('./socket')
initSocket(server)                          // ← pass http server

const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err))

// Routes
const authRoutes    = require('./routes/AuthRoutes')
const listingRoutes = require('./routes/ListingRoutes')
const bidRoutes     = require('./routes/BidRoutes')
const tradeRoutes   = require('./routes/TradeRoutes')

app.use('/', authRoutes)
app.use('/listings', listingRoutes)
app.use('/bids',     bidRoutes)
app.use('/trades',   tradeRoutes)

app.use((req, res) => res.status(404).json({ error: 'Route not found' }))
app.use((err, req, res, next) => res.status(err.status || 500).json({ error: err.message }))

// ← use server.listen NOT app.listen
server.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`))