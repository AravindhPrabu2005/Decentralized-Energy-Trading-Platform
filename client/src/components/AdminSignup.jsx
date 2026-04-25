import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { Sun, Battery, Zap, ChevronRight, ChevronLeft, Camera, X, User } from 'lucide-react';

export default function ProsumerSignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileError, setProfileError] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    energySource: 'Solar Panels',
    systemCapacity: '',
    installationDate: '',
    panelBrand: '',
    inverterBrand: '',
    batteryCapacity: '',
    batteryBrand: '',
    meterNumber: '',
    gridConnectionType: 'Bi-directional',
    agreeToTerms: false
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    setError('');
    setSuccess('');
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
      if (/\d/.test(value)) strength++;
      if (/[^a-zA-Z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setProfileError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('Only image files are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Image must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);
    setProfilePicture(file);
  };

  const handleRemoveProfilePic = () => {
    setProfilePreview(null);
    setProfilePicture(null);
    fileInputRef.current.value = '';
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields'); return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address'); return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long'); return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); return false;
    }
    if (!formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill in all contact information'); return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError('Pincode must be exactly 6 digits'); return false;
    }
    if (!/^\+?[\d\s\-]{10,13}$/.test(formData.phone)) {
      setError('Please enter a valid phone number'); return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.systemCapacity || !formData.installationDate || !formData.meterNumber) {
      setError('Please fill in all required energy system fields'); return false;
    }
    if (parseFloat(formData.systemCapacity) <= 0) {
      setError('System capacity must be greater than 0'); return false;
    }
    if (new Date(formData.installationDate) > new Date()) {
      setError('Installation date cannot be in the future'); return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) { setStep(2); setError(''); }
    else if (step === 2 && validateStep2()) { setStep(3); setError(''); }
  };

  const handleBack = () => { setStep(step - 1); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      data.append('city', formData.city);
      data.append('state', formData.state);
      data.append('pincode', formData.pincode);
      data.append('energySource', formData.energySource);
      data.append('systemCapacity', parseFloat(formData.systemCapacity));
      data.append('installationDate', formData.installationDate);
      data.append('panelBrand', formData.panelBrand);
      data.append('inverterBrand', formData.inverterBrand);
      if (formData.batteryCapacity !== '' && !isNaN(parseFloat(formData.batteryCapacity))) {
        data.append('batteryCapacity', parseFloat(formData.batteryCapacity));
      }
      data.append('batteryBrand', formData.batteryBrand);
      data.append('meterNumber', formData.meterNumber);
      data.append('gridConnectionType', formData.gridConnectionType);
      if (profilePicture) data.append('profilePicture', profilePicture);

      const response = await axiosInstance.post('/prosumer/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(response.data.message || 'Prosumer account created successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Error registering prosumer:', err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthTexts = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = passwordStrength > 0 ? strengthColors[passwordStrength - 1] : 'bg-gray-200';
  const strengthText = passwordStrength > 0 ? strengthTexts[passwordStrength - 1] : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-4">
          <a href="/">
            <img src="/greenwave-logo.png" alt="GreenWave Logo" className="h-16 w-auto" />
          </a>
          <nav className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Already have an account?</span>
            <a href="/login" className="text-sm font-semibold text-green-600 hover:text-green-700 px-4 py-2 rounded-lg transition">
              Sign In
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 lg:px-10 py-12">

        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>{s}</div>
                  <span className={`text-xs mt-2 font-medium ${step >= s ? 'text-green-600' : 'text-gray-500'}`}>
                    {s === 1 ? 'Personal' : s === 2 ? 'Energy System' : 'Review'}
                  </span>
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-4 rounded transition-all ${step > s ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 shadow-lg rounded-3xl p-8">

            {/* Card Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg">
                <Sun className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Prosumer Registration</h2>
              <p className="text-sm text-gray-500 mt-2">
                {step === 1 ? 'Personal Information' : step === 2 ? 'Energy System Details' : 'Review & Confirm'}
              </p>
            </div>

            {/* Alerts */}
            {success && (
              <div className="flex items-start gap-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div className="space-y-5">

                  {/* Profile Picture */}
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="relative">
                      <div className={`w-24 h-24 rounded-full border-2 overflow-hidden bg-gray-100 flex items-center justify-center ${profilePreview ? 'ring-2 ring-green-500 border-transparent' : 'border-gray-200'}`}>
                        {profilePreview
                          ? <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                          : <User className="w-10 h-10 text-gray-400" />
                        }
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-md transition-all"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                      {profilePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveProfilePic}
                          className="absolute top-0 right-0 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow transition-all"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{profilePreview ? 'Looking good!' : 'Upload profile photo'}</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WEBP · Max 2MB · Optional</p>
                    {profileError && <p className="text-xs text-red-500">{profileError}</p>}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your full name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your.email@example.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required placeholder="Create password"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                          {showPassword
                            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          }
                        </button>
                      </div>
                      {formData.password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                              <div key={level} className={`h-1.5 flex-1 rounded-full transition-all ${level <= passwordStrength ? strengthColor : 'bg-gray-200'}`} />
                            ))}
                          </div>
                          {strengthText && <p className="text-xs text-gray-500">Strength: <span className="font-medium">{strengthText}</span></p>}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Re-enter password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Street address"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="City"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <input type="text" name="state" value={formData.state} onChange={handleChange} required placeholder="State"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code *</label>
                      <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required placeholder="600001" maxLength="6"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2"><Sun className="inline w-4 h-4 mr-1" />Energy Source *</label>
                      <select name="energySource" value={formData.energySource} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="Solar Panels">Solar Panels</option>
                        <option value="Wind Turbine">Wind Turbine</option>
                        <option value="Hydro Power">Hydro Power</option>
                        <option value="Biomass">Biomass</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">System Capacity (kW) *</label>
                      <input type="number" name="systemCapacity" value={formData.systemCapacity} onChange={handleChange} required step="0.1" min="0.1" placeholder="10"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Installation Date *</label>
                      <input type="date" name="installationDate" value={formData.installationDate} onChange={handleChange} required max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Panel/Equipment Brand</label>
                      <input type="text" name="panelBrand" value={formData.panelBrand} onChange={handleChange} placeholder="Tata Power Solar"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Inverter Brand</label>
                      <input type="text" name="inverterBrand" value={formData.inverterBrand} onChange={handleChange} placeholder="Fronius Primo"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2"><Battery className="inline w-4 h-4 mr-1" />Battery Capacity (kWh)</label>
                      <input type="number" name="batteryCapacity" value={formData.batteryCapacity} onChange={handleChange} step="0.1" min="0" placeholder="15"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Battery Brand</label>
                      <input type="text" name="batteryBrand" value={formData.batteryBrand} onChange={handleChange} placeholder="Tesla Powerwall"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meter Number *</label>
                      <input type="text" name="meterNumber" value={formData.meterNumber} onChange={handleChange} required placeholder="MTR-123456789"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2"><Zap className="inline w-4 h-4 mr-1" />Grid Connection Type *</label>
                      <select name="gridConnectionType" value={formData.gridConnectionType} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="Bi-directional">Bi-directional</option>
                        <option value="Single-directional">Single-directional</option>
                        <option value="Off-grid">Off-grid</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3 ── */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Profile picture preview in review */}
                  {profilePreview && (
                    <div className="flex justify-center">
                      <img src={profilePreview} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-2 ring-green-500" />
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">Name</span><p className="font-medium text-gray-900">{formData.name}</p></div>
                      <div><span className="text-gray-500">Email</span><p className="font-medium text-gray-900">{formData.email}</p></div>
                      <div><span className="text-gray-500">Phone</span><p className="font-medium text-gray-900">{formData.phone}</p></div>
                      <div><span className="text-gray-500">Pincode</span><p className="font-medium text-gray-900">{formData.pincode}</p></div>
                      <div className="col-span-2"><span className="text-gray-500">Address</span><p className="font-medium text-gray-900">{formData.address}, {formData.city}, {formData.state}</p></div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Sun className="w-5 h-5 text-green-600" />Energy System Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-500">Source</span><p className="font-medium text-gray-900">{formData.energySource}</p></div>
                      <div><span className="text-gray-500">Capacity</span><p className="font-medium text-gray-900">{formData.systemCapacity} kW</p></div>
                      <div><span className="text-gray-500">Grid Type</span><p className="font-medium text-gray-900">{formData.gridConnectionType}</p></div>
                      <div><span className="text-gray-500">Battery</span><p className="font-medium text-gray-900">{formData.batteryCapacity || 'N/A'} {formData.batteryCapacity ? 'kWh' : ''}</p></div>
                      <div><span className="text-gray-500">Meter</span><p className="font-medium text-gray-900">{formData.meterNumber}</p></div>
                      <div><span className="text-gray-500">Installed</span><p className="font-medium text-gray-900">{new Date(formData.installationDate).toLocaleDateString('en-IN')}</p></div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                    <label className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-medium">Terms and Conditions</a>
                      {' '}and confirm that all information provided is accurate.
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-6">
                {step > 1 && (
                  <button type="button" onClick={handleBack}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                    <ChevronLeft size={20} /> Back
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-sm">
                    Next <ChevronRight size={20} />
                  </button>
                ) : (
                  <button type="submit" disabled={loading || !formData.agreeToTerms}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                      <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Creating Account...</>
                    ) : (
                      <>Create Prosumer Account <ChevronRight size={20} /></>
                    )}
                  </button>
                )}
              </div>
            </form>

            <div className="text-center pt-6 border-t border-gray-100 mt-6">
              <p className="text-sm text-gray-600">Already have an account?{' '}
                <a href="/login" className="font-medium text-green-600 hover:text-green-700">Sign in</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}