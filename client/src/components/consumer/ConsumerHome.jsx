import React, { useState, useEffect } from 'react'
import ConsumerNavbar from '../consumer/ConsumerNavbar'
import { Link } from 'react-router-dom'
import axiosInstance from '../../axiosInstance'
import { useSocket } from '../../hooks/useSocket'
import {
  ShoppingCart, Zap, TrendingDown, Clock,
  Battery, DollarSign, ArrowRight, CheckCircle,
  Package, Activity, RefreshCw
} from 'lucide-react'

export default function ConsumerHome() {
  const socket = useSocket()
  const user   = JSON.parse(localStorage.getItem('user') || '{}')

  const [currentTime, setCurrentTime]       = useState(new Date())
  const [profile, setProfile]               = useState(null)
  const [recentTrades, setRecentTrades]     = useState([])
  const [featuredListings, setFeaturedListings] = useState([])
  const [activeBids, setActiveBids]         = useState([])
  const [loading, setLoading]               = useState(true)
  const [toast, setToast]                   = useState(null)

  // Clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Fetch all data
  useEffect(() => { fetchAll() }, [])

  // Socket — live trade notification
  useEffect(() => {
    if (!socket) return
    socket.on('trade:matched', ({ message }) => {
      showToast(message)
      fetchAll()
    })
    socket.on('listing:new', () => fetchListings())
    return () => {
      socket.off('trade:matched')
      socket.off('listing:new')
    }
  }, [socket])

  const fetchAll = async () => {
    await Promise.all([fetchProfile(), fetchTrades(), fetchListings(), fetchBids()])
    setLoading(false)
  }

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get(`/consumer/profile/${user.id}`)
      setProfile(res.data.consumer)
    } catch (err) { console.error(err) }
  }

  const fetchTrades = async () => {
    try {
      const res = await axiosInstance.get(`/trades/consumer/${user.id}`)
      setRecentTrades(res.data.trades)
    } catch (err) { console.error(err) }
  }

  const fetchListings = async () => {
    try {
      const res = await axiosInstance.get('/listings?limit=3')
      setFeaturedListings(res.data.listings.slice(0, 3))
    } catch (err) { console.error(err) }
  }

  const fetchBids = async () => {
    try {
      const res = await axiosInstance.get(`/bids/my/${user.id}`)
      setActiveBids(res.data.bids.filter(b => ['pending', 'partially_filled'].includes(b.status)))
    } catch (err) { console.error(err) }
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 4000)
  }

  // ── Derived stats ──────────────────────────────────────────────
  const totalKwhBought   = recentTrades.reduce((s, t) => s + t.quantity, 0)
  const totalSpent       = recentTrades.reduce((s, t) => s + t.totalAmount, 0)
  const completedTrades  = recentTrades.filter(t => t.status === 'matched').length
  const carbonOffset     = (totalKwhBought * 0.82).toFixed(0) // 0.82 kg CO₂ per kWh saved

  const getStatusStyle = (status) => {
    switch (status) {
      case 'matched':          return 'bg-green-100 text-green-700'
      case 'partially_filled': return 'bg-yellow-100 text-yellow-700'
      case 'pending':          return 'bg-blue-100 text-blue-700'
      default:                 return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'matched':          return <CheckCircle size={14} />
      case 'partially_filled': return <Activity size={14} />
      case 'pending':          return <Clock size={14} />
      default:                 return <Package size={14} />
    }
  }

  const SOURCE_IMAGES = {
    Solar:   'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    Wind:    'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=300&fit=crop',
    Hydro:   'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
    Biomass: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
  }

  if (loading) {
    return (
      <>
        <ConsumerNavbar />
        <div className="mt-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-500 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ConsumerNavbar />

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium bg-green-600 text-white">
          <CheckCircle size={18} /> {toast}
        </div>
      )}

      <div className="mt-20 min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {profile?.name || user.name || 'Consumer'}! 👋
                </h1>
                <p className="text-green-100 text-lg">
                  {currentTime.toLocaleDateString('en-IN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
                <p className="text-green-100 mt-1 font-mono">
                  {currentTime.toLocaleTimeString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={fetchAll}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition">
                  <RefreshCw size={16} /> Refresh
                </button>
                <Link to="/consumer/marketplace"
                  className="bg-white text-green-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-green-50 transition shadow-md flex items-center gap-2 text-sm">
                  <ShoppingCart size={18} /> Browse Marketplace
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Zap className="text-green-600" size={22} />
                </div>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                  This Month
                </span>
              </div>
              <p className="text-gray-500 text-sm font-medium">Energy Purchased</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {totalKwhBought} <span className="text-lg font-normal text-gray-400">kWh</span>
              </p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingDown size={12} /> From {completedTrades} trades
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Battery className="text-blue-600" size={22} />
                </div>
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-gray-500 text-sm font-medium">Pending Bids</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{activeBids.length}</p>
              <p className="text-xs text-gray-400 mt-2">Waiting for auction match</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <DollarSign className="text-yellow-600" size={22} />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">Total Spent</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                ₹{totalSpent.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-green-600 mt-2">vs traditional grid pricing</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <Package className="text-emerald-600" size={22} />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">Carbon Offset</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {carbonOffset} <span className="text-lg font-normal text-gray-400">kg</span>
              </p>
              <p className="text-xs text-green-600 mt-2">CO₂ avoided</p>
            </div>
          </div>

          {/* Recent Trades + Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recent Trades */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-green-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Clock className="text-green-600" size={20} /> Recent Trades
                </h2>
                <Link to="/consumer/transactions"
                  className="text-green-600 hover:text-green-700 text-sm font-semibold flex items-center gap-1">
                  View All <ArrowRight size={15} />
                </Link>
              </div>

              {recentTrades.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingCart size={22} className="text-green-500" />
                  </div>
                  <p className="text-gray-500 font-medium">No trades yet</p>
                  <p className="text-gray-400 text-sm">Place a bid in the marketplace to get started</p>
                  <Link to="/consumer/marketplace"
                    className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1">
                    Go to Marketplace <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTrades.slice(0, 4).map(trade => (
                    <div key={trade._id}
                      className="border border-gray-100 rounded-xl p-4 hover:border-green-200 hover:shadow-sm transition">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-800">
                              {trade.energySource || 'Energy'} Trade
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusStyle(trade.status)}`}>
                              {getStatusIcon(trade.status)}
                              {trade.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 font-mono">#{trade._id.slice(-8).toUpperCase()}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="text-green-600 font-semibold">{trade.quantity} kWh</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">
                              ₹{trade.clearingPrice}/kWh • Auction #{trade.auctionRound}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-bold text-gray-800">
                            ₹{trade.totalAmount.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(trade.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Environmental Impact */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-sm p-6 text-white">
              <h2 className="text-lg font-bold mb-6">Environmental Impact</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <TrendingDown size={18} />
                    </div>
                    <span className="text-sm text-green-100">Carbon Offset</span>
                  </div>
                  <p className="text-3xl font-bold">{carbonOffset} kg</p>
                  <p className="text-xs text-green-100 mt-1">CO₂ reduced from trades</p>
                </div>

                <div className="border-t border-white/20 pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Zap size={18} />
                    </div>
                    <span className="text-sm text-green-100">Clean Energy</span>
                  </div>
                  <p className="text-3xl font-bold">{totalKwhBought} kWh</p>
                  <p className="text-xs text-green-100 mt-1">Renewable energy purchased</p>
                </div>

                <div className="border-t border-white/20 pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Activity size={18} />
                    </div>
                    <span className="text-sm text-green-100">Total Trades</span>
                  </div>
                  <p className="text-3xl font-bold">{completedTrades}</p>
                  <p className="text-xs text-green-100 mt-1">Completed successfully</p>
                </div>

                <Link to="/consumer/transactions"
                  className="w-full bg-white text-green-600 py-2.5 rounded-xl font-semibold hover:bg-green-50 transition flex items-center justify-center gap-2 text-sm">
                  View All Transactions <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Featured Listings from live marketplace */}
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="text-green-600" size={20} /> Featured Energy Offers
              </h2>
              <Link to="/consumer/marketplace"
                className="text-green-600 hover:text-green-700 text-sm font-semibold flex items-center gap-1">
                Explore More <ArrowRight size={15} />
              </Link>
            </div>

            {featuredListings.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap size={22} className="text-green-500" />
                </div>
                <p className="text-gray-500 font-medium">No listings available right now</p>
                <p className="text-gray-400 text-sm">Prosumers will add new listings shortly</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredListings.map(listing => (
                  <div key={listing._id}
                    className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-green-200 transition group">
                    <div className="relative h-44 overflow-hidden bg-green-50">
                      <img
                        src={SOURCE_IMAGES[listing.energySource] || SOURCE_IMAGES.Solar}
                        alt={listing.energySource}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-green-600 shadow-sm">
                        {listing.energySource}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-1">
                        {listing.prosumerName || 'Prosumer'}
                      </h3>
                      <p className="text-xs text-gray-400 mb-3">{listing.location || 'India'}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs text-gray-400">Available</p>
                          <p className="font-semibold text-gray-800">{listing.remainingQty} kWh</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Ask Price</p>
                          <p className="font-bold text-green-600">₹{listing.pricePerUnit}/kWh</p>
                        </div>
                      </div>

                      <Link to="/consumer/marketplace"
                        className="w-full bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm">
                        Place Bid <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}