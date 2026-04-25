import React, { useState, useEffect } from 'react'
import ProsumerNavbar from '../prosumer/ProsumerNavbar'
import axiosInstance from '../../axiosInstance'
import { useSocket } from '../../hooks/useSocket'
import { Plus, Zap, Sun, Wind, Droplets, Leaf, X, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

const SOURCE_ICONS = {
  Solar: <Sun size={16} className="text-yellow-500" />,
  Wind: <Wind size={16} className="text-blue-500" />,
  Hydro: <Droplets size={16} className="text-cyan-500" />,
  Biomass: <Leaf size={16} className="text-green-500" />,
}

const STATUS_STYLES = {
  active:           'bg-green-100 text-green-700',
  partially_filled: 'bg-yellow-100 text-yellow-700',
  fulfilled:        'bg-blue-100 text-blue-700',
  cancelled:        'bg-red-100 text-red-700',
  expired:          'bg-gray-100 text-gray-500',
}

const EMPTY_FORM = {
  energySource: 'Solar',
  quantity: '',
  pricePerUnit: '',
  minPricePerUnit: '',
  location: '',
  availableTo: '',
}

export default function ProsumerListing() {
  const socket = useSocket()
  const user   = JSON.parse(localStorage.getItem('user') || '{}')

  const [listings, setListings]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [submitting, setSubmitting]   = useState(false)
  const [formError, setFormError]     = useState('')
  const [toast, setToast]             = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  // ── Fetch my listings ─────────────────────────────────────────
  useEffect(() => {
    fetchListings()
  }, [])

  // ── Socket: real-time trade match notification ────────────────
  useEffect(() => {
    if (!socket) return
    socket.on('trade:matched', ({ message }) => showToast(message, 'success'))
    socket.on('auction:cleared', ({ clearingPrice, totalMatched }) => {
      if (totalMatched > 0) showToast(`Auction cleared at ₹${clearingPrice}/kWh — ${totalMatched} kWh matched`, 'info')
      fetchListings() // refresh status
    })
    return () => {
      socket.off('trade:matched')
      socket.off('auction:cleared')
    }
  }, [socket])

  const fetchListings = async () => {
    try {
      const res = await axiosInstance.get(`/listings/my/${user.id}`)
      setListings(res.data.listings)
    } catch (err) {
      showToast('Failed to load listings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (+form.minPricePerUnit > +form.pricePerUnit) {
      setFormError('Minimum price cannot exceed asking price')
      return
    }
    setSubmitting(true)
    try {
      await axiosInstance.post('/listings', {
        ...form,
        prosumerId:   user.id,
        prosumerName: user.name,
        quantity:     +form.quantity,
        pricePerUnit: +form.pricePerUnit,
        minPricePerUnit: +form.minPricePerUnit,
      })
      setShowForm(false)
      setForm(EMPTY_FORM)
      showToast('Listing created successfully!')
      fetchListings()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create listing')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id) => {
    setCancellingId(id)
    try {
      await axiosInstance.delete(`/listings/${id}`)
      showToast('Listing cancelled')
      fetchListings()
    } catch {
      showToast('Failed to cancel', 'error')
    } finally {
      setCancellingId(null)
    }
  }

  // ── Stats ─────────────────────────────────────────────────────
  const stats = {
    active:   listings.filter(l => l.status === 'active').length,
    fulfilled:listings.filter(l => l.status === 'fulfilled').length,
    totalEarned: listings.reduce((s, l) => s + (l.totalEarned || 0), 0),
    totalQty: listings.reduce((s, l) => s + (l.quantity || 0), 0),
  }

  return (
    <>
      <ProsumerNavbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === 'success' ? 'bg-green-600 text-white' :
            toast.type === 'error'   ? 'bg-red-500 text-white' :
                                       'bg-blue-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> :
           toast.type === 'error'   ? <AlertCircle size={18} /> :
                                      <Zap size={18} />}
          {toast.message}
        </div>
      )}

      <div className="mt-20 min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Energy Listings</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your sell offers — auction runs every 60 seconds</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition">
              <Plus size={18} /> New Listing
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Active Listings', value: stats.active,    color: 'text-green-600' },
              { label: 'Fulfilled',       value: stats.fulfilled, color: 'text-blue-600'  },
              { label: 'Total Posted',    value: `${stats.totalQty} kWh`, color: 'text-gray-700' },
              { label: 'Total Earned',    value: `₹${stats.totalEarned.toLocaleString('en-IN')}`, color: 'text-green-700' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Create Listing Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">Create Energy Listing</h2>
                  <button onClick={() => { setShowForm(false); setFormError('') }}
                    className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
                </div>

                {formError && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Energy Source */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Energy Source</label>
                    <select name="energySource" value={form.energySource} onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      {['Solar', 'Wind', 'Hydro', 'Biomass'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity + Ask Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kWh)</label>
                      <input type="number" name="quantity" value={form.quantity} onChange={handleFormChange}
                        placeholder="e.g. 50" min="1" required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ask Price (₹/kWh)</label>
                      <input type="number" name="pricePerUnit" value={form.pricePerUnit} onChange={handleFormChange}
                        placeholder="e.g. 8" min="1" step="0.01" required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                  </div>

                  {/* Min Price + Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹/kWh)</label>
                      <input type="number" name="minPricePerUnit" value={form.minPricePerUnit} onChange={handleFormChange}
                        placeholder="Floor price" min="1" step="0.01" required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input type="text" name="location" value={form.location} onChange={handleFormChange}
                        placeholder="e.g. Chennai"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                  </div>

                  {/* Available Until */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Until</label>
                    <input type="datetime-local" name="availableTo" value={form.availableTo} onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {submitting ? (
                      <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>Creating...</>
                    ) : <><Plus size={18} /> Create Listing</>}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Listings Table */}
          {loading ? (
            <div className="flex justify-center py-20">
              <svg className="animate-spin h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Zap size={32} className="text-green-500" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">No listings yet</p>
              <p className="text-gray-400 text-sm max-w-xs">Create your first energy listing to start selling to consumers in the marketplace.</p>
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition">
                <Plus size={16} /> Create First Listing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map(listing => (
                <div key={listing._id}
                  className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    {/* Left */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                        {SOURCE_ICONS[listing.energySource] || <Zap size={22} className="text-green-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{listing.energySource} Energy</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[listing.status]}`}>
                            {listing.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {listing.location || 'No location'} • Listed {new Date(listing.createdAt).toLocaleDateString('en-IN')}
                        </p>
                        {listing.availableTo && (
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock size={12} /> Expires {new Date(listing.availableTo).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Ask Price</p>
                        <p className="font-bold text-green-600 text-lg">₹{listing.pricePerUnit}/kWh</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Remaining</p>
                        <p className="font-semibold text-gray-800">
                          {listing.remainingQty} / {listing.quantity} kWh
                        </p>
                        {/* Progress bar */}
                        <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1">
                          <div className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${((listing.quantity - listing.remainingQty) / listing.quantity) * 100}%` }} />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Earned</p>
                        <p className="font-semibold text-gray-800">₹{(listing.totalEarned || 0).toLocaleString('en-IN')}</p>
                      </div>

                      {['active', 'partially_filled'].includes(listing.status) && (
                        <button onClick={() => handleCancel(listing._id)}
                          disabled={cancellingId === listing._id}
                          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition disabled:opacity-50">
                          {cancellingId === listing._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}