'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getShops, getFoodCourts } from '@/lib/data'
import { Shop, FoodCourt } from '@/lib/types'
import { BrandLogo } from '@/components/brand-logo'
import { RegisterCafeModal } from '@/components/register-cafe-modal'
import { Landing3DHero } from '@/components/landing-3d-hero'
import { 
  QrCode, Store, Sparkles, ChefHat, ShieldCheck, ArrowRight, 
  Table, Phone, Bell, Check, Utensils, Zap, ExternalLink, 
  Star, Layers, MapPin, ShoppingBag, Coffee, Menu, X, 
  Smartphone, Shield, ArrowUpRight, CheckCircle2, ChevronRight
} from 'lucide-react'

export default function HomePage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [shopsRes, fcRes] = await Promise.all([
          getShops(),
          getFoodCourts()
        ])
        setShops(shopsRes)
        setFoodCourts(fcRes)
      } catch (err) {
        console.error('Failed to load landing data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      {/* ----------------------------------------------------------------------- */}
      {/* 1. FLOATING MODERN HEADER */}
      {/* ----------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070A10]/80 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <BrandLogo size="md" subtitle="Shared Dining & Food Court OS" className="text-white" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Link href="/menu" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Utensils size={14} className="text-[#E50914]" />
              <span>Customer Menu</span>
            </Link>
            <Link href="/t/4" className="hover:text-white transition-colors flex items-center gap-1.5">
              <QrCode size={14} className="text-amber-400" />
              <span>Table QR Demo</span>
            </Link>
            <Link href="/partner" className="hover:text-white transition-colors flex items-center gap-1.5">
              <ChefHat size={14} className="text-red-400" />
              <span>Kitchen Staff Login</span>
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Shield size={14} className="text-blue-400" />
              <span>Plaza Admin</span>
            </Link>
          </nav>

          {/* Right Header Action */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all active:scale-95 cursor-pointer"
            >
              + Partner Cafe Request
            </button>
            <Link
              href="/menu"
              className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-600/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Scan & Order</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="md:hidden p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Slide-down Drawer */}
        {isMobileNavOpen && (
          <div className="md:hidden bg-[#0A0E18] border-b border-white/10 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <div className="space-y-3">
              <Link
                href="/menu"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600/20 text-[#E50914] flex items-center justify-center">
                    <Utensils size={18} />
                  </div>
                  <span>Browse Plaza Menu</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </Link>

              <Link
                href="/t/4"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <QrCode size={18} />
                  </div>
                  <span>Table #4 QR Simulation</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </Link>

              <Link
                href="/partner"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                    <ChefHat size={18} />
                  </div>
                  <span>Staff Kitchen Portal (Phone + PIN)</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </Link>

              <Link
                href="/admin"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Shield size={18} />
                  </div>
                  <span>SuperAdmin Portal (PIN: 9999)</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </Link>
            </div>

            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  setIsMobileNavOpen(false)
                  setIsRegisterModalOpen(true)
                }}
                className="w-full py-3 rounded-2xl bg-[#E50914] text-white font-black text-xs uppercase tracking-wider text-center"
              >
                Join as Partner Cafe
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ----------------------------------------------------------------------- */}
      {/* 2. HERO SECTION WITH THREE.JS 3D CANVAS & DYNAMIC AMBIENT GLOW */}
      {/* ----------------------------------------------------------------------- */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Three.js Interactive 3D Canvas */}
        <Landing3DHero />

        {/* Ambient Gradient Flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-red-600/25 via-amber-600/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-red-900/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-bold text-slate-300 shadow-2xl animate-in fade-in duration-700">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
            <Sparkles size={14} className="text-amber-400" />
            <span className="tracking-wide">PlazaBite OS 2.0 • Digital Food Court & Shared Dining Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            One Smart QR Code.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-300">
              Every Stall In The Plaza.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed">
            Dine at any shared table or pick up at the counter. Order hot momos, smash burgers, single-origin coffee, and waffles across multiple kitchens in one seamless cart. Money routes directly to each shop&apos;s UPI with zero gateway cuts.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/menu"
              className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] group"
            >
              <Utensils size={18} />
              <span>Explore Live Plaza Menu</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/t/4"
              className="w-full sm:w-auto h-14 px-7 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/15 backdrop-blur-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <QrCode size={18} className="text-amber-400" />
              <span>Table #4 QR Simulation</span>
            </Link>

            <Link
              href="/partner"
              className="w-full sm:w-auto h-14 px-7 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm border border-slate-700/80 backdrop-blur-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ChefHat size={18} className="text-[#E50914]" />
              <span>Staff Kitchen Portal</span>
            </Link>
          </div>

          {/* Trust Highlights Strip */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-400 mb-1">
                <Zap size={14} />
                <span>0% Commission</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">Direct NPCI UPI bank settlement to each cafe</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-black text-amber-400 mb-1">
                <Table size={14} />
                <span>Shared Seating</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">Sit anywhere, token pickup or runner delivery</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-black text-red-400 mb-1">
                <Bell size={14} />
                <span>Audio KOT Chimes</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">Cooks alerted with high-importance sound</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-black text-blue-400 mb-1">
                <Smartphone size={14} />
                <span>Native Apps</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">iOS & Android staff apps with instant sync</p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 3. INTERACTIVE SIMULATION: HOW PLAZABITE SOLVES SHARED FOOD COURTS */}
      {/* ----------------------------------------------------------------------- */}
      <section className="py-20 bg-[#0A0E18] border-y border-white/10 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#E50914] bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full inline-block mb-3">
              The Real-World Dilemma Solved
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              How It Works When Tables Are Shared
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
              In traditional food courts, customers have to walk from stall to stall, wait in 3 different lines, and fumble with separate payments. PlazaBite unifies it all.
            </p>
          </div>

          {/* Interactive Visual Diagram Card */}
          <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Left Column: Customer at Table 14 */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-red-600/20 text-[#E50914] border border-red-500/30 text-xs font-extrabold flex items-center gap-1.5">
                      <Table size={14} /> Seated at Table #14
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Diner Experience</span>
                  </div>
                  <h3 className="text-base font-black text-white">1 Scan $ightarrow$ 4 Menus in 1 Cart</h3>
                  <div className="space-y-2 text-xs font-medium text-slate-300">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                      <span>1x Crispy Chicken Roll</span>
                      <span className="text-red-400 font-bold font-mono">Caffellon</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                      <span>1x Steamed Chicken Momos</span>
                      <span className="text-amber-400 font-bold font-mono">Momo Haven</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                      <span>1x Iced Hazelnut Latte</span>
                      <span className="text-orange-400 font-bold font-mono">Brew & Beans</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column: Direct Intelligent Routing */}
              <div className="text-center space-y-4 px-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center mx-auto shadow-2xl shadow-red-500/30">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">PlazaBite Split Engine</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Instant parallel dispatch. Each kitchen receives their specific KOT ticket with audio chime.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                  <span>Direct UPI Payment to Each Stall</span>
                </div>
              </div>

              {/* Right Column: Independent Kitchen Dispatch */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-black text-xs">
                      K1
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Caffellon Kitchen</span>
                      <span className="text-[10px] text-slate-400">Chimes live • UPI Direct</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Prepares Roll
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs">
                      K2
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Momo Haven Kitchen</span>
                      <span className="text-[10px] text-slate-400">Chimes live • UPI Direct</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Steams Momos
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-xs">
                      K3
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Brew & Beans Barista</span>
                      <span className="text-[10px] text-slate-400">Chimes live • UPI Direct</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                    Brews Coffee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 4. THE 4 PLATFORM PILLARS */}
      {/* ----------------------------------------------------------------------- */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full inline-block mb-3">
            Core Infrastructure
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Engineered For Frictionless Hospitality
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
            Everything needed to run high-volume food courts, night markets, and multi-stall dining halls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-red-500/40 transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-[#E50914] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <QrCode size={24} />
              </div>
              <h3 className="text-lg font-black text-white mb-2">Universal Plaza QR</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One QR on table tents or at food court entrance opens the collective digital menu. Automatically detects single-shop vs multi-cafe venues.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-bold text-red-400">
              <span>Token & Table Modes</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-black text-white mb-2">Direct Shop UPI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every cafe stall sets their own merchant UPI ID. Money deposits straight into their bank with dynamic on-screen QR and 1-tap mobile launcher.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-bold text-emerald-400">
              <span>Zero Holding Accounts</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Bell size={24} />
              </div>
              <h3 className="text-lg font-black text-white mb-2">Audio KOT Alert</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kitchen staff receive high-priority synthesizer chimes and native haptics when new orders arrive, preventing missed tickets during rush hours.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-bold text-amber-400">
              <span>Web Audio & Native</span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-black text-white mb-2">Protected Multi-Role</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Role separation between Platform SuperAdmin (PIN 9999), Plaza Facility Manager, and Cafe Kitchen Staff (Phone Number + Secret PIN).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-bold text-blue-400">
              <span>Brute-force Lockout Guard</span>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 5. LIVE PARTICIPATING CAFES & STALLS */}
      {/* ----------------------------------------------------------------------- */}
      <section className="py-20 bg-[#0A0E18] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#E50914] block mb-1">
                Participating Outlets
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Featured Food Plaza Stalls
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Live kitchens ready to take table & takeaway orders in real time.
              </p>
            </div>

            <Link
              href="/menu"
              className="text-xs font-black uppercase tracking-wider text-[#E50914] hover:text-red-400 flex items-center gap-1.5"
            >
              <span>View All Menu Items</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Stalls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shops.slice(0, 4).map((shop) => (
              <div
                key={shop.id}
                className="bg-slate-900/60 rounded-3xl overflow-hidden border border-white/10 hover:border-red-500/40 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="relative aspect-[16/10] bg-slate-800 overflow-hidden">
                  <Image
                    src={shop.banner_url || shop.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'}
                    alt={shop.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black text-white flex items-center gap-1 border border-white/10">
                    <Star size={12} className="text-amber-400 fill-current" /> {shop.rating || 4.8}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                      {shop.category}
                    </span>
                    <h3 className="text-base font-black text-white leading-tight">
                      {shop.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {shop.description || 'Artisan rolls, fresh bites and beverages crafted for food court dining.'}
                  </p>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-slate-400">
                      {shop.estimated_time || '15-20 min'}
                    </span>
                    <Link
                      href={`/shop/${shop.id}/dashboard`}
                      className="font-bold text-[#E50914] hover:text-red-400 flex items-center gap-1"
                    >
                      <span>Kitchen KOT</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 6. VENDOR ONBOARDING CALLOUT BANNER */}
      {/* ----------------------------------------------------------------------- */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-[#E50914] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full inline-block">
              Expand Your Food Plaza
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Own a Stall, Cafe, or Restaurant?
            </h2>
            <p className="text-sm font-medium text-white/90 leading-relaxed">
              Submit an onboarding request to join this food plaza. Once approved by the plaza manager, your menu and direct UPI bank payments go live immediately.
            </p>
          </div>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-8 py-4 rounded-2xl bg-white text-[#E50914] hover:bg-slate-100 font-black text-sm uppercase tracking-wider shadow-2xl transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            Request to Join Food Court
          </button>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 7. MODERN FOOTER */}
      {/* ----------------------------------------------------------------------- */}
      <footer className="mt-auto bg-[#05070B] text-slate-400 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
            <BrandLogo size="md" subtitle="Digital Food Court Platform" className="text-white" />

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-300">
              <Link href="/menu" className="hover:text-white transition-colors">Customer Menu</Link>
              <Link href="/t/4" className="hover:text-white transition-colors">Table QR Demo</Link>
              <Link href="/partner" className="hover:text-white transition-colors">Kitchen Staff Portal</Link>
              <Link href="/admin" className="hover:text-white transition-colors">SuperAdmin Portal</Link>
              <button 
                onClick={() => setIsRegisterModalOpen(true)} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Partner Request
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} PlazaBite OS. Designed for shared dining & digital food courts.</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Three.js Engine Active • Zero Gateway Commission</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Register / Partner Cafe Modal */}
      <RegisterCafeModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  )
}
