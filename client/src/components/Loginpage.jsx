import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', response.data.user.isAdmin.toString());

        if (response.data.user.isAdmin) {
          window.location.href = '/prosumer/home';
        } else {
          window.location.href = '/consumer/home';
        }
      } else {
        setError(response.data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError(err.response?.data?.message || 'Unable to connect. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Professional Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-4">
          <a href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition">
              <span className="text-white font-bold text-lg">GX</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-gray-900 tracking-tight">
                GreenWave
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                Energy Exchange
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-2">
            <a
              href="/pricing"
              className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition"
            >
              Pricing
            </a>
            <a
              href="/about"
              className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition"
            >
              About
            </a>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <a
              href="/prosumer/signup"
              className="text-sm font-semibold text-white bg-green-500 hover:bg-green-600 px-5 py-2 rounded-full transition shadow-sm hover:shadow"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left: Value Proposition */}
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-700">
                2.4 MWh traded in the last hour
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Access Your
                <span className="block text-green-600 mt-1">Energy Dashboard</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                Monitor real-time energy trades, track transparent pricing, and manage your renewable energy participation—all from one secure platform.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Real-time Metering</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Live energy tracking</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">P2P Marketplace</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Community-driven</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">256-bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">GDPR Compliant</span>
              </div>
            </div>
          </section>

          {/* Right: Login Form */}
          <section className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white border border-gray-200/60 shadow-[0_20px_70px_rgba(0,0,0,0.08)] rounded-3xl p-8 space-y-6">
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Sign in to your GreenWave account to continue
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <a href="/forgot-password" className="text-xs font-medium text-green-600 hover:text-green-700">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      autoComplete="current-password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !formData.email || !formData.password}
                  className="w-full flex items-center justify-center gap-2 text-base font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl px-4 py-3.5 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500">New to GreenWave?</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/prosumer/signup"
                  className="flex-1 text-center text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-100 px-4 py-2.5 rounded-xl transition"
                >
                  Sign up as Prosumer
                </a>
                <a
                  href="/consumer/signup"
                  className="flex-1 text-center text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-xl transition"
                >
                  Sign up as Consumer
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2025 GreenWave Energy Exchange. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-gray-700 transition">Privacy</a>
              <a href="/terms" className="hover:text-gray-700 transition">Terms</a>
              <a href="/support" className="hover:text-gray-700 transition">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
