import React, { useState, useEffect, useRef } from 'react'
import ProsumerNavbar from '../prosumer/ProsumerNavbar'
import axiosInstance from '../../axiosInstance'
import {
  Sun, Battery, Zap, MapPin, Mail, Phone,
  Calendar, Award, TrendingUp, Edit2, Save, X
} from 'lucide-react'

const ProsumerProfile = () => {
  const [userData, setUserData] = useState(null)
  const [editedData, setEditedData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profilePreview, setProfilePreview] = useState(null)
  const [profileFile, setProfileFile] = useState(null)
  const fileInputRef = useRef()

  // ✅ Fetch prosumer profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        const userId = storedUser.id || localStorage.getItem('userId')

        const response = await axiosInstance.get(`/prosumer/profile/${userId}`)
        const data = response.data.prosumer

        setUserData(data)
        setEditedData(data)
        setProfilePreview(data.profilePicture || null)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
    setEditedData(userData)
    setProfilePreview(userData.profilePicture || null)
    setProfileFile(null)
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedData(userData)
    setProfilePreview(userData.profilePicture || null)
    setProfileFile(null)
    setError('')
  }

  const handleInputChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed'); return }
    if (file.size > 2 * 1024 * 1024) { setError('Image must be less than 2MB'); return }
    setProfileFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setProfilePreview(reader.result)
    reader.readAsDataURL(file)
    setError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = storedUser.id || localStorage.getItem('userId')

      const formData = new FormData()
      formData.append('name', editedData.name)
      formData.append('phone', editedData.phone)
      formData.append('address', editedData.address)
      formData.append('city', editedData.city)
      formData.append('state', editedData.state)
      formData.append('pincode', editedData.pincode)
      formData.append('energySource', editedData.energySource)
      formData.append('systemCapacity', editedData.systemCapacity)
      formData.append('installationDate', editedData.installationDate)
      formData.append('panelBrand', editedData.panelBrand || '')
      formData.append('inverterBrand', editedData.inverterBrand || '')
      formData.append('batteryCapacity', editedData.batteryCapacity || '')
      formData.append('batteryBrand', editedData.batteryBrand || '')
      if (profileFile) formData.append('profilePicture', profileFile)

      const response = await axiosInstance.put(`/prosumer/profile/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const updated = response.data.prosumer
      setUserData(updated)
      setEditedData(updated)
      setIsEditing(false)
      setProfileFile(null)
      setSuccess('Profile updated successfully!')

      // ✅ Sync localStorage so navbar updates immediately
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        name: updated.name,
        profilePicture: updated.profilePicture || null
      }))

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.response?.data?.error || 'Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Loading State ─────────────────────────────────
  if (loading) {
    return (
      <>
        <ProsumerNavbar />
        <div className="mt-24 min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-500 font-medium">Loading your profile...</p>
          </div>
        </div>
      </>
    )
  }

  // ─── Error State ────────────────────────────────────
  if (!userData) {
    return (
      <>
        <ProsumerNavbar />
        <div className="mt-24 min-h-screen bg-white flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-red-500 font-medium">{error || 'Profile not found.'}</p>
            <button onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
              Retry
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ProsumerNavbar />
      <div className="mt-24 min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Alerts */}
          {success && (
            <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left Column ── */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm">

                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full bg-green-100 border-4 border-green-500 overflow-hidden flex items-center justify-center">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-green-700 font-bold">
                          {userData.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-green-600 rounded-full p-2 cursor-pointer hover:bg-green-700 transition-colors shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-gray-800 text-center">{userData.name}</h2>
                  <p className="text-sm text-green-600 font-medium mt-1">Solar Prosumer</p>

                  <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {userData.prosumerId}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Award size={12} /> Verified
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < Math.floor(userData.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{userData.rating || '—'}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3 border-t border-green-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Member Since</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {userData.createdAt
                        ? new Date(userData.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Transactions</span>
                    <span className="text-sm font-semibold text-gray-800">{userData.totalTransactions || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Earnings</span>
                    <span className="text-sm font-semibold text-green-600">
                      ₹{userData.totalEarnings?.toLocaleString('en-IN') || '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">City</span>
                    <span className="text-sm font-semibold text-gray-800">{userData.city || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isEditing ? (
                  <button onClick={handleEdit}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <Edit2 size={20} /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button onClick={handleSave} disabled={saving}
                      className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                      {saving ? (
                        <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>Saving...</>
                      ) : <><Save size={20} /> Save Changes</>}
                    </button>
                    <button onClick={handleCancel} disabled={saving}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                      <X size={20} /> Cancel
                    </button>
                  </>
                )}
              </div>

              {/* Performance Stats */}
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 shadow-sm text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp size={20} /> Performance Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-green-100 text-xs mb-1">Total Energy Produced</p>
                    <p className="text-2xl font-bold">
                      {userData.totalEnergyProduced?.toLocaleString('en-IN') || '0'} kWh
                    </p>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <p className="text-green-100 text-xs mb-1">Total Energy Sold</p>
                    <p className="text-2xl font-bold">
                      {userData.totalEnergySold?.toLocaleString('en-IN') || '0'} kWh
                    </p>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <p className="text-green-100 text-xs mb-1">Carbon Offset</p>
                    <p className="text-2xl font-bold">
                      {userData.carbonOffset?.toLocaleString('en-IN') || '0'} kg CO₂
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Personal Information */}
              <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    {isEditing ? (
                      <input type="text" name="name" value={editedData.name || ''} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{userData.name || '—'}</p>
                    )}
                  </div>

                  {/* Email — read only */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Mail size={15} />Email Address</label>
                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">
                      {userData.email || '—'}
                      {isEditing && <span className="ml-2 text-xs text-gray-400">(not editable)</span>}
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Phone size={15} />Phone Number</label>
                    {isEditing ? (
                      <input type="tel" name="phone" value={editedData.phone || ''} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{userData.phone || '—'}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                    {isEditing ? (
                      <input type="text" name="city" value={editedData.city || ''} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{userData.city || '—'}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                    {isEditing ? (
                      <input type="text" name="state" value={editedData.state || ''} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{userData.state || '—'}</p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">PIN Code</label>
                    {isEditing ? (
                      <input type="text" name="pincode" value={editedData.pincode || ''} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{userData.pincode || '—'}</p>
                    )}
                  </div>

                  {/* Address — full width */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><MapPin size={15} />Full Address</label>
                    {isEditing ? (
                      <textarea name="address" value={editedData.address || ''} onChange={handleInputChange} rows="2"
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{userData.address || '—'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Energy System Details */}
              <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-green-100">
                  <Sun className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-800">Energy System Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Energy Source</label>
                    {isEditing ? (
                      <select name="energySource" value={editedData.energySource || ''} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="Solar Panels">Solar Panels</option>
                        <option value="Wind Turbine">Wind Turbine</option>
                        <option value="Hydro Power">Hydro Power</option>
                        <option value="Biomass">Biomass</option>
                      </select>
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{userData.energySource || '—'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">System Capacity (kW)</label>
                    {isEditing ? (
                      <input type="number" name="systemCapacity" value={editedData.systemCapacity || ''} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{userData.systemCapacity ? `${userData.systemCapacity} kW` : '—'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Calendar size={15} />Installation Date</label>
                    {isEditing ? (
                      <input type="date" name="installationDate"
                        value={editedData.installationDate ? new Date(editedData.installationDate).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">
                        {userData.installationDate
                          ? new Date(userData.installationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Panel Brand</label>
                    {isEditing ? (
                      <input type="text" name="panelBrand" value={editedData.panelBrand || ''} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{userData.panelBrand || '—'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Inverter Brand</label>
                    {isEditing ? (
                      <input type="text" name="inverterBrand" value={editedData.inverterBrand || ''} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{userData.inverterBrand || '—'}</p>
                    )}
                  </div>

                  {/* Meter Number — read only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Meter Number</label>
                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800 font-mono">{userData.meterNumber || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Battery Storage */}
              <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-green-100">
                  <Battery className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-800">Battery Storage</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Battery Capacity (kWh)</label>
                    {isEditing ? (
                      <input type="number" name="batteryCapacity" value={editedData.batteryCapacity || ''} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">
                        {userData.batteryCapacity ? `${userData.batteryCapacity} kWh` : '—'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Battery Brand</label>
                    {isEditing ? (
                      <input type="text" name="batteryBrand" value={editedData.batteryBrand || ''} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{userData.batteryBrand || '—'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Zap size={15} />Grid Connection Type</label>
                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{userData.gridConnectionType || '—'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Prosumer ID</label>
                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800 font-mono">{userData.prosumerId || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-800">Account Security</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Password</p>
                    <p className="text-xs text-gray-400 mt-0.5">Keep your account secure</p>
                  </div>
                  <button className="px-5 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors">
                    Change Password
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProsumerProfile