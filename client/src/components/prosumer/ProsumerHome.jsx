import React, { useState, useEffect } from 'react'
import ProsumerNavbar from './ProsumerNavbar'
import { Link } from 'react-router-dom'
import { 
  ShoppingCart, 
  Zap, 
  TrendingUp,
  TrendingDown,
  Clock, 
  Battery, 
  DollarSign,
  ArrowRight,
  Sun,
  CheckCircle,
  Activity,
  Package,
  Upload,
  Download,
  Eye,
  Edit,
  Plus
} from 'lucide-react'

const ProsumerHome = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview')

  // Sample data - replace with actual API calls
  const userData = {
    name: 'Aravindh Prabu',
    accountType: 'Solar Prosumer',
    // Production data
    currentProduction: '8.5',
    totalProduced: '1,250',
    surplus: '320',
    totalSold: '280',
    // Consumption data
    currentConsumption: '3.2',
    totalPurchased: '150',
    // Financial data
    earnings: '₹12,450',
    expenses: '₹3,200',
    netBalance: '₹9,250',
    // Stats
    activeSales: 5,
    activePurchases: 2,
    completedTransactions: 45,
    carbonOffset: '425'
  }

  const myListings = [
    {
      id: 'LIST-2024-001',
      amount: '50 kWh',
      price: '₹8.5/kWh',
      total: '₹425',
      status: 'Active',
      views: 23,
      date: '10 Jan 2026'
    },
    {
      id: 'LIST-2024-002',
      amount: '75 kWh',
      price: '₹9.0/kWh',
      total: '₹675',
      status: 'Active',
      views: 18,
      date: '12 Jan 2026'
    },
    {
      id: 'LIST-2024-003',
      amount: '40 kWh',
      price: '₹8.2/kWh',
      total: '₹328',
      status: 'Sold',
      views: 35,
      date: '08 Jan 2026'
    }
  ]

  const recentTransactions = [
    {
      id: 'TXN-2024-045',
      type: 'sale',
      party: 'Consumer - Rahul Kumar',
      amount: '40 kWh',
      price: '₹328',
      status: 'Completed',
      date: '13 Jan 2026'
    },
    {
      id: 'TXN-2024-044',
      type: 'purchase',
      party: 'Wind Power Co.',
      amount: '25 kWh',
      price: '₹225',
      status: 'Completed',
      date: '12 Jan 2026'
    },
    {
      id: 'TXN-2024-043',
      type: 'sale',
      party: 'Consumer - Priya Singh',
      amount: '60 kWh',
      price: '₹510',
      status: 'In Progress',
      date: '11 Jan 2026'
    },
    {
      id: 'TXN-2024-042',
      type: 'purchase',
      party: 'Solar Valley Farms',
      amount: '30 kWh',
      price: '₹255',
      status: 'In Progress',
      date: '10 Jan 2026'
    }
  ]

  const marketplaceOffers = [
    {
      id: 1,
      seller: 'WindTech Solutions',
      type: 'Wind',
      available: '150 kWh',
      price: '₹9.0/kWh',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      seller: 'Hydro Power Inc',
      type: 'Hydro',
      available: '100 kWh',
      price: '₹7.8/kWh',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      seller: 'Green Energy Hub',
      type: 'Solar',
      available: '200 kWh',
      price: '₹8.3/kWh',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'Active': return 'bg-blue-100 text-blue-700'
      case 'In Progress': return 'bg-yellow-100 text-yellow-700'
      case 'Sold': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircle size={16} />
      case 'Active': return <Activity size={16} />
      case 'In Progress': return <Clock size={16} />
      case 'Sold': return <Package size={16} />
      default: return <Package size={16} />
    }
  }

  return (
    <>
      <ProsumerNavbar />
      <div className='mt-20 min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          
          {/* Welcome Section */}
          <div className='bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 mb-8 text-white shadow-lg'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div>
                <h1 className='text-3xl font-bold mb-2'>Welcome back, {userData.name}! 👋</h1>
                <p className='text-green-100 text-lg flex items-center gap-2'>
                  <Sun size={20} />
                  {userData.accountType}
                </p>
                <p className='text-green-100 mt-2'>
                  {currentTime.toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} • {currentTime.toLocaleTimeString('en-IN')}
                </p>
              </div>
              <div className='flex gap-3'>
                <Link 
                  to='/prosumer/create-listing'
                  className='bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all shadow-md flex items-center gap-2'
                >
                  <Plus size={20} />
                  Sell Energy
                </Link>
                <Link 
                  to='/prosumer/marketplace'
                  className='bg-green-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-900 transition-all shadow-md flex items-center gap-2'
                >
                  <ShoppingCart size={20} />
                  Buy Energy
                </Link>
              </div>
            </div>
          </div>

          {/* Primary Stats Grid - Production & Consumption */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            {/* Production Card */}
            <div className='bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-md text-white'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold flex items-center gap-2'>
                  <Upload size={20} />
                  Energy Production
                </h3>
                <span className='text-xs bg-white/20 px-3 py-1 rounded-full'>Live</span>
              </div>
              
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <p className='text-green-100 text-sm mb-1'>Current Output</p>
                  <p className='text-3xl font-bold'>{userData.currentProduction} <span className='text-lg'>kW</span></p>
                </div>
                <div>
                  <p className='text-green-100 text-sm mb-1'>Surplus</p>
                  <p className='text-3xl font-bold'>{userData.surplus} <span className='text-lg'>kWh</span></p>
                </div>
              </div>

              <div className='border-t border-white/20 pt-4 grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-green-100 text-xs mb-1'>Total Produced</p>
                  <p className='text-xl font-semibold'>{userData.totalProduced} kWh</p>
                </div>
                <div>
                  <p className='text-green-100 text-xs mb-1'>Total Sold</p>
                  <p className='text-xl font-semibold'>{userData.totalSold} kWh</p>
                </div>
              </div>
            </div>

            {/* Consumption Card */}
            <div className='bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-md text-white'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold flex items-center gap-2'>
                  <Download size={20} />
                  Energy Consumption
                </h3>
                <span className='text-xs bg-white/20 px-3 py-1 rounded-full'>Live</span>
              </div>
              
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <p className='text-blue-100 text-sm mb-1'>Current Usage</p>
                  <p className='text-3xl font-bold'>{userData.currentConsumption} <span className='text-lg'>kW</span></p>
                </div>
                <div>
                  <p className='text-blue-100 text-sm mb-1'>Self-Sufficiency</p>
                  <p className='text-3xl font-bold'>73<span className='text-lg'>%</span></p>
                </div>
              </div>

              <div className='border-t border-white/20 pt-4 grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-blue-100 text-xs mb-1'>From Own Source</p>
                  <p className='text-xl font-semibold'>1,100 kWh</p>
                </div>
                <div>
                  <p className='text-blue-100 text-xs mb-1'>Purchased</p>
                  <p className='text-xl font-semibold'>{userData.totalPurchased} kWh</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial & Activity Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            {/* Earnings */}
            <div className='bg-white rounded-xl p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow'>
              <div className='flex items-center justify-between mb-4'>
                <div className='bg-green-100 p-3 rounded-lg'>
                  <TrendingUp className='text-green-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Total Earnings</h3>
              <p className='text-2xl font-bold text-gray-800'>{userData.earnings}</p>
              <p className='text-xs text-green-600 mt-2'>From energy sales</p>
            </div>

            {/* Expenses */}
            <div className='bg-white rounded-xl p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow'>
              <div className='flex items-center justify-between mb-4'>
                <div className='bg-red-100 p-3 rounded-lg'>
                  <TrendingDown className='text-red-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Total Expenses</h3>
              <p className='text-2xl font-bold text-gray-800'>{userData.expenses}</p>
              <p className='text-xs text-gray-500 mt-2'>Energy purchases</p>
            </div>

            {/* Net Balance */}
            <div className='bg-white rounded-xl p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow'>
              <div className='flex items-center justify-between mb-4'>
                <div className='bg-yellow-100 p-3 rounded-lg'>
                  <DollarSign className='text-yellow-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Net Balance</h3>
              <p className='text-2xl font-bold text-green-600'>{userData.netBalance}</p>
              <p className='text-xs text-gray-500 mt-2'>This month</p>
            </div>

            {/* Active Transactions */}
            <div className='bg-white rounded-xl p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow'>
              <div className='flex items-center justify-between mb-4'>
                <div className='bg-purple-100 p-3 rounded-lg'>
                  <Activity className='text-purple-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Active Deals</h3>
              <p className='text-2xl font-bold text-gray-800'>{userData.activeSales + userData.activePurchases}</p>
              <p className='text-xs text-gray-500 mt-2'>{userData.completedTransactions} completed</p>
            </div>
          </div>

          {/* Tabs Section */}
          <div className='bg-white rounded-xl shadow-md border border-green-100 mb-8'>
            <div className='flex border-b border-gray-200'>
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'overview' 
                    ? 'text-green-600 border-b-2 border-green-600' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Recent Transactions
              </button>
              <button
                onClick={() => setActiveTab('selling')}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'selling' 
                    ? 'text-green-600 border-b-2 border-green-600' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                My Listings ({userData.activeSales})
              </button>
              <button
                onClick={() => setActiveTab('buying')}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'buying' 
                    ? 'text-green-600 border-b-2 border-green-600' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Marketplace
              </button>
            </div>

            <div className='p-6'>
              {/* Recent Transactions Tab */}
              {activeTab === 'overview' && (
                <div className='space-y-4'>
                  {recentTransactions.map((txn) => (
                    <div 
                      key={txn.id}
                      className='border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all'
                    >
                      <div className='flex flex-col md:flex-row md:items-center justify-between gap-3'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-3 mb-2'>
                            <div className={`p-2 rounded-lg ${txn.type === 'sale' ? 'bg-green-100' : 'bg-blue-100'}`}>
                              {txn.type === 'sale' ? (
                                <Upload className='text-green-600' size={16} />
                              ) : (
                                <Download className='text-blue-600' size={16} />
                              )}
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 flex-wrap'>
                                <span className='font-semibold text-gray-800'>{txn.party}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(txn.status)}`}>
                                  {getStatusIcon(txn.status)} {txn.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className='text-sm text-gray-600 ml-11'>Transaction ID: <span className='font-mono'>{txn.id}</span></p>
                          <div className='flex items-center gap-4 mt-2 text-sm ml-11'>
                            <span className={`font-semibold ${txn.type === 'sale' ? 'text-green-600' : 'text-blue-600'}`}>
                              {txn.type === 'sale' ? '↑' : '↓'} {txn.amount}
                            </span>
                            <span className='text-gray-400'>•</span>
                            <span className='text-gray-600'>{txn.date}</span>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className={`text-2xl font-bold ${txn.type === 'sale' ? 'text-green-600' : 'text-blue-600'}`}>
                            {txn.type === 'sale' ? '+' : '-'}{txn.price}
                          </p>
                          <p className='text-xs text-gray-500'>{txn.type === 'sale' ? 'Earned' : 'Spent'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className='text-center pt-4'>
                    <Link 
                      to='/prosumer/transactions'
                      className='text-green-600 hover:text-green-700 font-semibold inline-flex items-center gap-2'
                    >
                      View All Transactions <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              )}

              {/* My Listings Tab */}
              {activeTab === 'selling' && (
                <div className='space-y-4'>
                  <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-lg font-semibold text-gray-800'>Your Energy Listings</h3>
                    <Link 
                      to='/prosumer/create-listing'
                      className='bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2'
                    >
                      <Plus size={18} />
                      Create New Listing
                    </Link>
                  </div>
                  {myListings.map((listing) => (
                    <div 
                      key={listing.id}
                      className='border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all'
                    >
                      <div className='flex flex-col md:flex-row md:items-center justify-between gap-3'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className='font-semibold text-gray-800'>{listing.amount}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(listing.status)}`}>
                              {getStatusIcon(listing.status)}
                              {listing.status}
                            </span>
                          </div>
                          <p className='text-sm text-gray-600'>Listing ID: <span className='font-mono'>{listing.id}</span></p>
                          <div className='flex items-center gap-4 mt-2 text-sm'>
                            <span className='text-green-600 font-semibold'>{listing.price}</span>
                            <span className='text-gray-400'>•</span>
                            <span className='flex items-center gap-1 text-gray-600'>
                              <Eye size={14} />
                              {listing.views} views
                            </span>
                            <span className='text-gray-400'>•</span>
                            <span className='text-gray-600'>{listing.date}</span>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <div className='text-right mr-4'>
                            <p className='text-sm text-gray-600'>Total Value</p>
                            <p className='text-2xl font-bold text-gray-800'>{listing.total}</p>
                          </div>
                          {listing.status === 'Active' && (
                            <button className='bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors'>
                              <Edit size={20} className='text-gray-600' />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Marketplace Tab */}
              {activeTab === 'buying' && (
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>Available Energy from Other Prosumers</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    {marketplaceOffers.map((offer) => (
                      <div 
                        key={offer.id}
                        className='border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-green-300 transition-all group'
                      >
                        <div className='relative h-48 overflow-hidden'>
                          <img 
                            src={offer.image} 
                            alt={offer.seller}
                            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                          />
                          <div className='absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold text-green-600'>
                            {offer.type}
                          </div>
                        </div>
                        
                        <div className='p-4'>
                          <h3 className='font-bold text-gray-800 mb-2'>{offer.seller}</h3>
                          <div className='flex items-center gap-1 mb-3'>
                            <div className='flex'>
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(offer.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                  fill='currentColor'
                                  viewBox='0 0 20 20'
                                >
                                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                </svg>
                              ))}
                            </div>
                            <span className='text-sm text-gray-600 ml-1'>{offer.rating}</span>
                          </div>
                          
                          <div className='flex items-center justify-between mb-4'>
                            <div>
                              <p className='text-sm text-gray-600'>Available</p>
                              <p className='font-semibold text-gray-800'>{offer.available}</p>
                            </div>
                            <div className='text-right'>
                              <p className='text-sm text-gray-600'>Price</p>
                              <p className='font-bold text-green-600'>{offer.price}</p>
                            </div>
                          </div>

                          <Link 
                            to='/prosumer/marketplace'
                            className='w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2'
                          >
                            Buy Now
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='text-center mt-6'>
                    <Link 
                      to='/prosumer/marketplace'
                      className='text-green-600 hover:text-green-700 font-semibold inline-flex items-center gap-2'
                    >
                      Browse Full Marketplace <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Environmental Impact Card */}
          <div className='bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-md p-6 text-white'>
            <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
              <Battery size={24} />
              Your Environmental Impact
            </h2>
            
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <div>
                <div className='bg-white/20 p-3 rounded-lg w-fit mb-3'>
                  <TrendingDown size={24} />
                </div>
                <p className='text-sm text-green-100 mb-1'>Carbon Offset</p>
                <p className='text-3xl font-bold'>{userData.carbonOffset} kg</p>
                <p className='text-xs text-green-100 mt-1'>CO₂ prevented</p>
              </div>

              <div>
                <div className='bg-white/20 p-3 rounded-lg w-fit mb-3'>
                  <Sun size={24} />
                </div>
                <p className='text-sm text-green-100 mb-1'>Clean Energy</p>
                <p className='text-3xl font-bold'>100%</p>
                <p className='text-xs text-green-100 mt-1'>Renewable source</p>
              </div>

              <div>
                <div className='bg-white/20 p-3 rounded-lg w-fit mb-3'>
                  <Battery size={24} />
                </div>
                <p className='text-sm text-green-100 mb-1'>Self-Sufficiency</p>
                <p className='text-3xl font-bold'>73%</p>
                <p className='text-xs text-green-100 mt-1'>Independence rate</p>
              </div>

              <div className='flex items-center'>
                <Link 
                  to='/prosumer/analytics'
                  className='w-full bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2'
                >
                  View Detailed Analytics
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default ProsumerHome
