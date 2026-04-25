import React, { useState, useEffect } from 'react'
import ConsumerNavbar from '../consumer/ConsumerNavbar'
import axiosInstance from '../../axiosInstance'
import { useSocket } from '../../hooks/useSocket'
import { Zap, Sun, Wind, Droplets, Leaf, ShoppingCart, CheckCircle, AlertCircle, Activity, Clock, X } from 'lucide-react'

const SOURCE_ICONS = {
  Solar:   <Sun size={16} className="text-yellow-500" />,
  Wind:    <Wind size={16} className="text-blue-500" />,
  Hydro:   <Droplets size={16} className="text-cyan-500" />,
  Biomass: <Leaf size={16} className="text-green-500" />,
}

export default function ConsumerMarket() {
  const socket = useSocket()
  const user   = JSON.parse(localStorage.getItem('user') || '{}')

  const [listings, setListings]     = useState([])
  const [myBids, setMyBids]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [countdown, setCountdown]   = useState(60)
  const [auctionInfo, setAuctionInfo] = useState(null)
  const [toast, setToast]           = useState(null)
  const [bidModal, setBidModal]     = useState(null)  // listing being bid on
  const [bidForm, setBidForm]       = useState({ quantity: '', pricePerUnit: '' })
  const [bidSubmitting, setBidSubmitting] = useState(false)
  const [bidError, setBidError]     = useState('')
  const [filter, setFilter]         = useState('All')
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCountdown(c => c <= 1 ? 60 : c - 1), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('listing:new', l => setListings(prev => [l, ...prev]))
    socket.on('listing:updated', u => setListings(prev => prev.map(l => l._id === u._id ? u : l)))
    socket.on('auction:cleared', data => {
      setAuctionInfo(data)
      setCountdown(60)
      fetchData()
    })
    socket.on('trade:matched', ({ message }) => showToast(message, 'success'))
    return () => {
      socket.off('listing:new')
      socket.off('listing:updated')
      socket.off('auction:cleared')
      socket.off('trade:matched')
    }
  }, [socket])

  const fetchData = async () => {
    try {
      const [listRes, bidRes] = await Promise.all([
        axiosInstance.get('/listings'),
        axiosInstance.get(`/bids/my/${user.id}`),
      ])
      setListings(listRes.data.listings)
      setMyBids(bidRes.data.bids)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const openBidModal = (listing) => {
    setBidModal(listing)
    setBidForm({ quantity: '', pricePerUnit: listing.pricePerUnit })
    setBidError('')
  }

  const handlePlaceBid = async (e) => {
    e.preventDefault()
    if (+bidForm.quantity > bidModal.remainingQty) {
      setBidError(`Max available: ${bidModal.remainingQty} kWh`)
      return
    }
    setBidSubmitting(true)
    try {
      await axiosInstance.post('/bids', {
        consumerId:   user.id,
        consumerName: user.name,
        quantity:     +bidForm.quantity,
        pricePerUnit: +bidForm.pricePerUnit,
        preferredSource: bidModal.energySource,
      })
      setBidModal(null)
      showToast('Bid placed! Waiting for next auction round.')
      fetchData()
    } catch (err) {
      setBidError(err.response?.data?.error || 'Failed to place bid')
    } finally {
      setBidSubmitting(false)
    }
  }

  const handleCancelBid = async (id) => {
    setCancellingId(id)
    try {
      await axiosInstance.delete(`/bids/${id}`)
      showToast('Bid cancelled')
      fetchData()
    } catch {
      showToast('Failed to cancel bid', 'error')
    } finally {
      setCancellingId(null)
    }
  }

  const filtered = filter === 'All' ? listings : listings.filter(l => l.energySource === filter)
  const activeBids = myBids.filter(b => ['pending', 'partially_filled'].includes(b.status))

  return (
    <>
      <ConsumerNavbar />

      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium
          ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Bid Modal */}
      {bidModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Place a Bid</h2>
              <button onClick={() => setBidModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-1">
              <p className="text-sm font-semibold text-green-800">{bidModal.energySource} Energy Listing</p>
              <p className="text-xs text-green-600">by {bidModal.prosumerName} • {bidModal.location || 'Unknown'}</p>
              <p className="text-xs text-gray-500">Ask: <strong>₹{bidModal.pricePerUnit}/kWh</strong> • Available: <strong>{bidModal.remainingQty} kWh</strong></p>
            </div>

            {bidError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{bidError}</div>
            )}

            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (kWh) <span className="text-gray-400">max {bidModal.remainingQty}</span>
                </label>
                <input type="number" value={bidForm.quantity}
                  onChange={e => { setBidForm({ ...bidForm, quantity: e.target.value }); setBidError('') }}
                  placeholder={`1 – ${bidModal.remainingQty}`}
                  min="1" max={bidModal.remainingQty} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Bid Price (₹/kWh)
                  <span className="text-gray-400 ml-1">— higher bid = better match chance</span>
                </label>
                <input type="number" value={bidForm.pricePerUnit}
                  onChange={e => setBidForm({ ...bidForm, pricePerUnit: e.target.value })}
                  placeholder={`min ₹${bidModal.minPricePerUnit}`}
                  min={bidModal.minPricePerUnit} step="0.01" required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>

              {bidForm.quantity && bidForm.pricePerUnit && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Total</span>
                    <span className="font-bold text-green-700">
                      ₹{(+bidForm.quantity * +bidForm.pricePerUnit).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Actual cost will be the McAfee clearing price × quantity</p>
                </div>
              )}

              <button type="submit" disabled={bidSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                {bidSubmitting ? (
                  <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>Placing bid...</>
                ) : <><ShoppingCart size={16} /> Place Bid</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-20 min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Energy Marketplace</h1>
            <p className="text-sm text-gray-500 mt-1">Browse listings & place bids — auction runs every 60 seconds</p>
          </div>

          {/* Countdown + Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-green-600 text-white rounded-2xl p-4 shadow-sm">
              <p className="text-green-100 text-xs">Next Auction In</p>
              <p className="text-3xl font-bold mt-1">{countdown}s</p>
              <p className="text-green-200 text-xs mt-1 flex items-center gap-1">
                <Activity size={12} /> McAfee Double Auction
              </p>
            </div>
            <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">Available Listings</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{listings.length}</p>
            </div>
            <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">My Active Bids</p>
              <p className="text-xl font-bold text-green-600 mt-1">{activeBids.length}</p>
            </div>
            <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">Avg Market Price</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                ₹{listings.length
                  ? (listings.reduce((s, l) => s + l.pricePerUnit, 0) / listings.length).toFixed(2)
                  : '—'}/kWh
              </p>
            </div>
          </div>

          {/* Last Auction */}
          {auctionInfo?.totalMatched > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3">
              <Zap size={20} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800 font-medium">
                Last auction: <strong>{auctionInfo.totalMatched} kWh</strong> matched at <strong>₹{auctionInfo.clearingPrice}/kWh</strong>
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Marketplace Listings */}
            <div className="lg:col-span-2 space-y-4">
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
                  <p className="text-gray-400 text-sm">Check back soon — prosumers are adding new listings</p>
                </div>
              ) : (
                filtered.map(listing => (
                  <div key={listing._id}
                    className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                          {SOURCE_ICONS[listing.energySource] || <Zap size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{listing.energySource} Energy</p>
                          <p className="text-xs text-gray-400">by {listing.prosumerName || 'Prosumer'} • {listing.location || 'Unknown'}</p>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                            {listing.remainingQty} kWh available
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-green-600">₹{listing.pricePerUnit}</p>
                        <p className="text-xs text-gray-400">per kWh</p>
                        <button onClick={() => openBidModal(listing)}
                          className="mt-2 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition">
                          <ShoppingCart size={13} /> Place Bid
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* My Active Bids */}
            <div className="space-y-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock size={18} className="text-green-600" /> My Active Bids
              </h2>
              {activeBids.length === 0 ? (
                <div className="bg-white border border-green-100 rounded-2xl p-6 text-center">
                  <p className="text-sm text-gray-400">No active bids</p>
                  <p className="text-xs text-gray-300 mt-1">Place a bid on any listing</p>
                </div>
              ) : (
                activeBids.map(bid => (
                  <div key={bid._id} className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{bid.preferredSource || 'Any'} Energy</p>
                        <p className="text-xs text-gray-400 mt-0.5">{bid.remainingQty} kWh @ ₹{bid.pricePerUnit}/kWh</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block
                          ${bid.status === 'partially_filled' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                          {bid.status.replace('_', ' ')}
                        </span>
                      </div>
                      <button onClick={() => handleCancelBid(bid._id)}
                        disabled={cancellingId === bid._id}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-100 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        {cancellingId === bid._id ? '...' : 'Cancel'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Clock size={11} /> Placed {new Date(bid.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}