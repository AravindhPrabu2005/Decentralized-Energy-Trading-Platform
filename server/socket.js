const { Server } = require('socket.io')
const { runAuction } = require('./auction/mcafeeEngine')

let io

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`)

    // Client joins their personal room for targeted events
    socket.on('join', ({ userId }) => {
      if (userId) {
        socket.join(`user_${userId}`)
        console.log(`👤 User ${userId} joined room`)
      }
    })

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`)
    })
  })

  // ── Run auction every 60 seconds ──────────────────────────────
  setInterval(() => runAuction(io), 60 * 1000)
  console.log('⏱️  Auction engine scheduled every 60s')

  return io
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized')
  return io
}

module.exports = { initSocket, getIO }