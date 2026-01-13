import React from 'react'
import { Link } from 'react-router-dom'


const LandingPage = () => {
  return (
    <>
      {/* Top Nav */}
      <header className="w-full flex items-center justify-between px-10 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Logo image - much larger size */}
          <img
            src="/greenwave-logo.png"
            alt="GreenWave Energy Exchange logo"
            className="h-20 w-auto"
          />
        </div>


        <nav className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Log In
          </Link>


          <Link
            to="/prosumer/signup"
            className="text-sm font-medium bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
          >
            Sign up as Prosumer
          </Link>


          <Link
            to="/consumer/signup"
            className="text-sm font-medium border border-slate-200 text-slate-800 px-4 py-2 rounded-full hover:bg-slate-50 transition"
          >
            Sign up as Consumer
          </Link>
        </nav>
      </header>


      {/* Hero Section */}
      <main className="min-h-[calc(100vh-72px)] flex items-center justify-between px-10 py-10 bg-white">
        {/* Left: Text content */}
        <section className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
            Welcome to <span className="text-green-500">GreenWave</span>
          </h1>
          <p className="text-lg text-slate-600 mb-2">
            Peer‑to‑peer, decentralized energy trading — clean power,
            transparent pricing, and community‑owned grids.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            Monetize your surplus renewable energy or buy clean power directly from
            your community through our secure energy exchange platform.
          </p>


          <div className="flex gap-4 flex-wrap">
            <Link
              to="/login"
              className="bg-green-500 text-white font-medium px-6 py-3 rounded-full hover:bg-green-600 transition text-sm"
            >
              Log In
            </Link>
            <Link
              to="/prosumer/signup"
              className="border border-slate-200 text-slate-800 font-medium px-6 py-3 rounded-full hover:bg-slate-50 transition text-sm"
            >
              Get Started as Prosumer
            </Link>
            <Link
              to="/consumer/signup"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              I'm a Consumer →
            </Link>
          </div>


          <div className="mt-6 flex flex-wrap gap-6 text-xs text-slate-500">
            <div>
              🔗 Peer-to-peer energy marketplace  
              <br />🔋 Real‑time energy metering
            </div>
            <div>
              ☀️ Solar, wind & hydro supported  
              <br />🌍 Community‑driven microgrids
            </div>
          </div>
        </section>


        {/* Right: Hero image */}
        <section className="hidden md:flex flex-1 justify-center">
          <div className="relative w-[420px] h-[420px] rounded-3xl overflow-hidden shadow-lg bg-slate-900/80">
            {/* Background accent shape */}
            <div className="absolute inset-6 rounded-3xl border border-green-400/40" />


            {/* Renewable energy image using external URL */}
            <img
              src="https://images.pexels.com/photos/9875443/pexels-photo-9875443.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Renewable energy panels"
              className="w-full h-full object-cover opacity-80"
            />


            {/* Overlay stats card */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500">Live energy trading</p>
                <p className="text-sm font-semibold text-slate-900">
                  2.4 MWh traded today
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Avg. price</p>
                <p className="text-sm font-semibold text-green-500">
                  ₹4.2 / kWh
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}


export default LandingPage
