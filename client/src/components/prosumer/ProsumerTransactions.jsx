import React, { useState, useEffect } from 'react'
import ProsumerNavbar from '../prosumer/ProsumerNavbar'
import axiosInstance from '../../axiosInstance'
import { useSocket } from '../../hooks/useSocket'
import { TrendingUp, Zap, CheckCircle, Clock, Filter } from 'lucide-react'

export default function ProsumerTransactions() {
  const socket = useSocket()
  const user   = JSON.parse(localStorage.getItem('user') || '{}')

  const [trades, setTrades]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [toast, setToast]       = useState(null)

  useEffect(() => { fetchTrades() }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('trade:matched', ({ trade, message }) => {
      setTrades(prev => [trade, ...prev])
      setToast(message)
      setTimeout(() => setToast(null), 4000)
    })
    return () => socket.off('trade:matched')
  }, [socket])

  const fetchTrades = async () => {
    try {
      const res = await axiosInstance.get(`/trades/prosumer/${user.id}`)
      setTrades(res.data.trades)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total:       trades.length,
    totalKwh:    trades.reduce((s, t) => s + t.quantity, 0),
    totalEarned: trades.reduce((s, t) => s + t.totalAmount, 0),
    avgPrice:    trades.length
      ? (trades.reduce((s, t) => s + t.clearingPrice, 0) / trades.length).toFixed(2)
      : 0,
  }

  const filtered = filter === 'all' ? trades
    : trades.filter(t => t.energySource?.toLowerCase() === filter)

  return (
    <>
      <ProsumerNavbar />

      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium bg-green-600 text-white">
          <CheckCircle size={18} /> {toast}
        </div>
      )}

      <div className="mt-20 min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-sm text-gray-500 mt-1">All your settled energy trades</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Trades',    value: stats.total,                                    color: 'text-gray-800'  },
              { label: 'Energy Sold',     value: `${stats.totalKwh} kWh`,                       color: 'text-blue-600'  },
              { label: 'Total Earned',    value: `₹${stats.totalEarned.toLocaleString('en-IN')}`,color: 'text-green-600' },
              { label: 'Avg Clearing ₹', value: `₹${stats.avgPrice}/kWh`,                      color: 'text-green-700' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap items-center">
            <Filter size={16} className="text-gray-400" />
            {['all', 'solar', 'wind', 'hydro', 'biomass'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize
                  ${filter === f ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Trades Table */}
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
                <TrendingUp size={28} className="text-green-500" />
              </div>
              <p className="text-gray-600 font-medium">No transactions yet</p>
              <p className="text-gray-400 text-sm">Trades will appear here after the auction matches your listings</p>
            </div>
          ) : (
            <div className="bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Date & Time', 'Energy', 'Qty (kWh)', 'Ask ₹', 'Clearing ₹', 'Total Earned', 'Auction #', 'Status'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(trade => (
                      <tr key={trade._id} className="hover:bg-green-50/30 transition">
                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                          {new Date(trade.createdAt).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-800">{trade.energySource || '—'}</td>
                        <td className="px-5 py-4 font-semibold text-gray-800">{trade.quantity}</td>
                        <td className="px-5 py-4 text-gray-600">₹{trade.askPrice}</td>
                        <td className="px-5 py-4 font-bold text-green-600">₹{trade.clearingPrice}</td>
                        <td className="px-5 py-4 font-bold text-green-700">₹{trade.totalAmount.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 text-gray-500">#{trade.auctionRound}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold capitalize">
                            {trade.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}