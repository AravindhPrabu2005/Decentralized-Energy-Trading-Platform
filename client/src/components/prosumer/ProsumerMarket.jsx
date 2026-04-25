import React, { useState, useEffect } from 'react'
import ProsumerNavbar from '../prosumer/ProsumerNavbar'
import axiosInstance from '../../axiosInstance'
import { useSocket } from '../../hooks/useSocket'
import { Zap, TrendingUp, Activity, Clock, Sun, Wind, Droplets, Leaf, RefreshCw } from 'lucide-react'

const SOURCE_ICONS = {
  Solar:   <Sun size={16} className="text-yellow-500" />,
  Wind:    <Wind size={16} className="text-blue-500" />,
  Hydro:   <Droplets size={16} className="text-cyan-500" />,
  Biomass: <Leaf size={16} className="text-green-500" />,
}

export default function ProsumerMarket() {
  const socket = useSocket()

  const [listings, setListings]       = useState([])
  const [recentTrades, setRecentTrades] = useState([])
  const [auctionInfo, setAuctionInfo] = useState(null)
  const [countdown, setCountdown]     = useState(60)
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('All')

  useEffect(() => {
    fetchMarketData()
  }, [])

  // Countdown to next auction
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => c <= 1 ? 60 : c - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Socket events
  useEffect(() => {
    if (!socket) return

    socket.on('listing:new', (listing) => {
      setListings(prev => [listing, ...prev])
    })
    socket.on('listing:updated', (updated) => {
      setListings(prev => prev.map(l => l._id === updated._id ? updated : l))
    })
    socket.on('auction:cleared', (data) => {
      setAuctionInfo(data)
      setCountdown(60)
      fetchMarketData()
    })

    return () => {
      socket.off('listing:new')
      socket.off('listing:updated')
      socket.off('auction:cleared')
    }
  }, [socket])

  const fetchMarketData = async () => {
    try {
      const [listingsRes, tradesRes] = await Promise.all([
        axiosInstance.get('/listings'),
        axiosInstance.get('/trades/market'),
      ])
      setListings(listingsRes.data.listings)
      setRecentTrades(tradesRes.data.trades)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'All' ? listings : listings.filter(l => l.energySource === filter)

  const avgPrice = listings.length
    ? (listings.reduce((s, l) => s + l.pricePerUnit, 0) / listings.length).toFixed(2)
    : '—'
  const totalAvail = listings.reduce((s, l) => s + (l.remainingQty || 0), 0)

  return (
    <>
      <ProsumerNavbar />
      <div className="mt-20 min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Marketplace</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time P2P energy trading — McAfee Double Auction</p>
            </div>
            <button onClick={fetchMarketData}
              className="flex items-center gap-2 text-sm text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition">
              <RefreshCw size={15} /> Refresh
            </button>
          </div>

          {/* Auction Countdown + Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-green-600 text-white rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1">
              <p className="text-green-100 text-xs">Next Auction In</p>
              <p className="text-3xl font-bold mt-1">{countdown}s</p>
              <p className="text-green-200 text-xs mt-1 flex items-center gap-1">
                <Activity size={12} /> Auto-clears every 60s
              </p>
            </div>
            <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">Avg Market Price</p>
              <p className="text-xl font-bold text-green-600 mt-1">₹{avgPrice}/kWh</p>
            </div>
            <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">Available Energy</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{totalAvail} kWh</p>
            </div>
            <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">Active Listings</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{listings.length}</p>
            </div>
          </div>

          {/* Last Auction Result */}
          {auctionInfo && auctionInfo.totalMatched > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3">
              <Zap size={20} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800 font-medium">
                Last auction (Round #{auctionInfo.round}): <strong>{auctionInfo.totalMatched} kWh</strong> matched
                at <strong>₹{auctionInfo.clearingPrice}/kWh</strong> across {auctionInfo.totalTrades} trades
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Listings */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                {['All', 'Solar', 'Wind', 'Hydro', 'Biomass'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition
                      ${filter === f ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}>
                    {f}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <svg className="animate-spin h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center space-y-3">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <Zap size={28} className="text-green-500" />
                  </div>
                  <p className="text-gray-600 font-medium">No listings available</p>
                  <p className="text-gray-400 text-sm">Check back after the next auction round</p>
                </div>
              ) : (
                filtered.map(listing => (
                  <div key={listing._id}
                    className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                          {SOURCE_ICONS[listing.energySource] || <Zap size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{listing.energySource} Energy</p>
                          <p className="text-xs text-gray-400">by {listing.prosumerName || 'Prosumer'} • {listing.location || 'Unknown'}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              {listing.remainingQty} kWh left
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={11} /> {new Date(listing.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-green-600">₹{listing.pricePerUnit}</p>
                        <p className="text-xs text-gray-400">per kWh</p>
                        <p className="text-xs text-gray-400 mt-1">Floor: ₹{listing.minPricePerUnit}</p>
                      </div>
                    </div>

                    {/* Fill progress */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Filled</span>
                        <span>{listing.quantity - listing.remainingQty}/{listing.quantity} kWh</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${((listing.quantity - listing.remainingQty) / listing.quantity) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent Trades Feed */}
            <div className="space-y-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-600" /> Recent Trades
              </h2>
              <div className="space-y-3">
                {recentTrades.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No trades yet</p>
                ) : recentTrades.map(trade => (
                  <div key={trade._id}
                    className="bg-white border border-green-100 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{trade.quantity} kWh {trade.energySource}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(trade.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">₹{trade.clearingPrice}/kWh</p>
                        <p className="text-xs text-gray-400">₹{trade.totalAmount} total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}