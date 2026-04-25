import React, { useState, useEffect } from 'react'
import ConsumerNavbar from './ConsumerNavbar'
import { Link } from 'react-router-dom'
import { 
  ShoppingCart, 
  Zap, 
  TrendingDown, 
  Clock, 
  Battery, 
  DollarSign,
  ArrowRight,
  Calendar,
  CheckCircle,
  Package,
  Activity
} from 'lucide-react'

const ConsumerHome = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Sample data - replace with actual API calls
  const userData = {
    name: 'Aravindh Prabu',
    currentConsumption: '3.2',
    totalPurchased: '450',
    pendingOrders: 3,
    completedOrders: 12,
    monthlySavings: '₹2,450',
    carbonOffset: '125'
  }

  const recentOrders = [
    {
      id: 'ORD-2024-001',
      seller: 'Solar Farm A',
      amount: '50 kWh',
      price: '₹450',
      status: 'Completed',
      date: '10 Jan 2026'
    },
    {
      id: 'ORD-2024-002',
      seller: 'Wind Power Co.',
      amount: '75 kWh',
      price: '₹650',
      status: 'In Progress',
      date: '12 Jan 2026'
    },
    {
      id: 'ORD-2024-003',
      seller: 'Green Energy Hub',
      amount: '30 kWh',
      price: '₹280',
      status: 'Pending',
      date: '13 Jan 2026'
    }
  ]

  const marketplaceHighlights = [
    {
      id: 1,
      seller: 'Solar Valley Farms',
      type: 'Solar',
      available: '200 kWh',
      price: '₹8.5/kWh',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      seller: 'WindTech Solutions',
      type: 'Wind',
      available: '150 kWh',
      price: '₹9.0/kWh',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      seller: 'Hydro Power Inc',
      type: 'Hydro',
      available: '100 kWh',
      price: '₹7.8/kWh',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'In Progress': return 'bg-blue-100 text-blue-700'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircle size={16} />
      case 'In Progress': return <Activity size={16} />
      case 'Pending': return <Clock size={16} />
      default: return <Package size={16} />
    }
  }

  return (
    <>
      <ConsumerNavbar />
      <div className='mt-20 min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          
          {/* Welcome Section */}
          <div className='bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 mb-8 text-white shadow-lg'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div>
                <h1 className='text-3xl font-bold mb-2'>Welcome back, {userData.name}! 👋</h1>
                <p className='text-green-100 text-lg'>
                  {currentTime.toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className='text-green-100 mt-1'>
                  {currentTime.toLocaleTimeString('en-IN')}
                </p>
              </div>
              <Link 
                to='/consumer/marketplace'
                className='bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all shadow-md flex items-center gap-2'
              >
                <ShoppingCart size={20} />
                Browse Marketplace
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {/* Current Consumption */}
            <div className='bg-white rounded-xl p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow'>
              <div className='flex items-center justify-between mb-4'>
                <div className='bg-green-100 p-3 rounded-lg'>
                  <Zap className='text-green-600' size={24} />
                </div>
                <span className='text-sm text-gray-500'>Live</span>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Current Usage</h3>
              <p className='text-3xl font-bold text-gray-800'>{userData.currentConsumption} <span className='text-lg'>kW</span></p>
              <p className='text-xs text-green-600 mt-2 flex items-center gap-1'>
                <TrendingDown size={14} />
                12% lower than average
              </p>
            </div>

            {/* Total Purchased */}
            <div className='bg-white rounded-xl p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow'>
              <div className='flex items-center justify-between mb-4'>
                <div className='bg-blue-100 p-3 rounded-lg'>
                  <Battery className='text-blue-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Energy Purchased</h3>
              <p className='text-3xl font-bold text-gray-800'>{userData.totalPurchased} <span className='text-lg'>kWh</span></p>
              <p className='text-xs text-gray-500 mt-2'>This month</p>
            </div>

            {/* Monthly Savings */}
            <div className='bg-white rounded-xl p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow'>
              <div className='flex items-center justify-between mb-4'>
                <div className='bg-yellow-100 p-3 rounded-lg'>
                  <DollarSign className='text-yellow-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Monthly Savings</h3>
              <p className='text-3xl font-bold text-gray-800'>{userData.monthlySavings}</p>
              <p className='text-xs text-green-600 mt-2'>vs traditional grid</p>
            </div>

            {/* Pending Orders */}
            <div className='bg-white rounded-xl p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow'>
              <div className='flex items-center justify-between mb-4'>
                <div className='bg-purple-100 p-3 rounded-lg'>
                  <Package className='text-purple-600' size={24} />
                </div>
              </div>
              <h3 className='text-gray-600 text-sm font-medium mb-1'>Active Orders</h3>
              <p className='text-3xl font-bold text-gray-800'>{userData.pendingOrders}</p>
              <p className='text-xs text-gray-500 mt-2'>{userData.completedOrders} completed total</p>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
            {/* Recent Orders */}
            <div className='lg:col-span-2 bg-white rounded-xl shadow-md border border-green-100 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                  <Clock className='text-green-600' size={24} />
                  Recent Orders
                </h2>
                <Link 
                  to='/consumer/my-orders'
                  className='text-green-600 hover:text-green-700 text-sm font-semibold flex items-center gap-1'
                >
                  View All <ArrowRight size={16} />
                </Link>
              </div>

              <div className='space-y-4'>
                {recentOrders.map((order) => (
                  <div 
                    key={order.id}
                    className='border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all'
                  >
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-3'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='font-semibold text-gray-800'>{order.seller}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600'>Order ID: <span className='font-mono'>{order.id}</span></p>
                        <div className='flex items-center gap-4 mt-2 text-sm'>
                          <span className='text-green-600 font-semibold'>{order.amount}</span>
                          <span className='text-gray-400'>•</span>
                          <span className='text-gray-600'>{order.date}</span>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-2xl font-bold text-gray-800'>{order.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className='bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-md p-6 text-white'>
              <h2 className='text-xl font-bold mb-6'>Environmental Impact</h2>
              
              <div className='space-y-6'>
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='bg-white/20 p-2 rounded-lg'>
                      <TrendingDown size={20} />
                    </div>
                    <span className='text-sm text-green-100'>Carbon Offset</span>
                  </div>
                  <p className='text-3xl font-bold'>{userData.carbonOffset} kg</p>
                  <p className='text-xs text-green-100 mt-1'>CO₂ reduced this month</p>
                </div>

                <div className='border-t border-white/20 pt-6'>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='bg-white/20 p-2 rounded-lg'>
                      <Battery size={20} />
                    </div>
                    <span className='text-sm text-green-100'>Clean Energy</span>
                  </div>
                  <p className='text-3xl font-bold'>85%</p>
                  <p className='text-xs text-green-100 mt-1'>Of total consumption</p>
                </div>

                <div className='border-t border-white/20 pt-6'>
                  <Link 
                    to='/consumer/my-orders'
                    className='w-full bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2'
                  >
                    View Analytics
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Marketplace Highlights */}
          <div className='bg-white rounded-xl shadow-md border border-green-100 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                <ShoppingCart className='text-green-600' size={24} />
                Featured Energy Offers
              </h2>
              <Link 
                to='/consumer/marketplace'
                className='text-green-600 hover:text-green-700 text-sm font-semibold flex items-center gap-1'
              >
                Explore More <ArrowRight size={16} />
              </Link>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {marketplaceHighlights.map((offer) => (
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
                      to='/consumer/marketplace'
                      className='w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2'
                    >
                      Buy Now
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default ConsumerHome
