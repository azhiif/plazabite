'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getShops } from '@/lib/data'
import { Shop } from '@/lib/types'
import { BrandLogo } from '@/components/brand-logo'
import { RegisterCafeModal } from '@/components/register-cafe-modal'
import { Landing3DHero } from '@/components/landing-3d-hero'
import { ArrowRight, Menu, X, ArrowUpRight } from 'lucide-react'

export default function HomePage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    getShops().then(setShops).catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E2E8F0] flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      {/* ----------------------------------------------------------------------- */}
      {/* 1. MINIMAL HEADER */}
      {/* ----------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0C10]/85 border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <BrandLogo size="md" subtitle="" className="text-white" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium tracking-wide text-zinc-400">
            <Link href="/menu" className="hover:text-white transition-colors">Menu</Link>
            <Link href="/t/4" className="hover:text-white transition-colors">Table QR</Link>
            <Link href="/partner" className="hover:text-white transition-colors">Kitchen</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          </nav>

          {/* Header Action */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              List Your Stall
            </button>
            <Link
              href="/menu"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#E50914] hover:bg-red-600 text-white transition-colors flex items-center gap-1.5"
            >
              <span>Open Menu</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0D0F15] border-b border-white/[0.08] px-6 py-5 space-y-3">
            <Link
              href="/menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-zinc-300 hover:text-white"
            >
              Digital Menu
            </Link>
            <Link
              href="/t/4"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-zinc-300 hover:text-white"
            >
              Table #4 Demo
            </Link>
            <Link
              href="/partner"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-zinc-300 hover:text-white"
            >
              Kitchen Staff Login
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-zinc-300 hover:text-white"
            >
              SuperAdmin Portal
            </Link>
            <div className="pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsRegisterModalOpen(true)
                }}
                className="w-full py-2.5 rounded-lg bg-white/[0.06] text-xs font-semibold text-white text-center hover:bg-white/[0.1]"
              >
                Register Your Stall
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ----------------------------------------------------------------------- */}
      {/* 2. HERO SECTION */}
      {/* ----------------------------------------------------------------------- */}
      <section className="relative min-h-[82vh] flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Subtle Architectural 3D Object */}
        <Landing3DHero />

        {/* Ambient Warm Vignette */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-red-600/[0.07] rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block">
            Shared Dining & Food Court Platform
          </span>

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] text-white leading-[1.12]">
            Food courts, unified.
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400 font-normal leading-relaxed">
            One QR code for every stall. Order from multiple kitchens in a single cart, with direct UPI payments to each shop and zero commissions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/menu"
              className="w-full sm:w-auto h-12 px-7 rounded-xl bg-[#E50914] hover:bg-red-600 text-white font-medium text-xs tracking-wide uppercase transition-colors flex items-center justify-center gap-2"
            >
              <span>Browse Menu</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/partner"
              className="w-full sm:w-auto h-12 px-7 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white font-medium text-xs tracking-wide uppercase border border-white/[0.1] transition-colors flex items-center justify-center"
            >
              <span>Staff Login</span>
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center gap-6 text-[11px] text-zinc-500">
            <span>Direct Shop UPI</span>
            <span>•</span>
            <span>Counter Pickup & Dine-in</span>
            <span>•</span>
            <Link href="/t/4" className="text-zinc-400 hover:text-white underline underline-offset-4">
              Try Table Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 3. HOW IT WORKS (CLEAN 3-STEP FLOW) */}
      {/* ----------------------------------------------------------------------- */}
      <section className="py-20 border-t border-white/[0.08] bg-[#080A0E]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 block mb-1.5">
              How It Works
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Simple for diners. Direct for kitchens.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-xs font-mono font-medium text-[#E50914]">01</span>
              <h3 className="text-base font-semibold text-white">Scan</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Scan any QR at your table or plaza entrance. All participating stalls load instantly in one collective view.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono font-medium text-[#E50914]">02</span>
              <h3 className="text-base font-semibold text-white">Select</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Add dumplings from Stall A and drinks from Stall B into one cart. The system routes each item to its kitchen.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono font-medium text-[#E50914]">03</span>
              <h3 className="text-base font-semibold text-white">Pay</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Pay directly to each shop&apos;s UPI bank account. Pick up at the counter or receive at your table when ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 4. PARTICIPATING OUTLETS */}
      {/* ----------------------------------------------------------------------- */}
      <section className="py-20 border-t border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 block mb-1">
                Outlets
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Participating kitchens
              </h2>
            </div>

            <Link
              href="/menu"
              className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Full Menu</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {shops.slice(0, 4).map((shop) => (
              <div
                key={shop.id}
                className="bg-[#10131B] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/[0.16] transition-colors flex flex-col justify-between"
              >
                <div className="relative aspect-[16/11] bg-zinc-900">
                  <Image
                    src={shop.banner_url || shop.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'}
                    alt={shop.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 block">
                      {shop.category}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-0.5">
                      {shop.name}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1 font-normal leading-relaxed">
                      {shop.description || 'Specialty dishes prepared fresh to order.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {shop.estimated_time || '15 min'}
                    </span>
                    <Link
                      href={`/shop/${shop.id}/dashboard`}
                      className="text-zinc-400 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Kitchen</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 5. VENDOR CALLOUT */}
      {/* ----------------------------------------------------------------------- */}
      <section className="py-16 border-t border-white/[0.08] bg-[#080A0E]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-white">Own a stall or restaurant?</h3>
            <p className="text-xs text-zinc-400 max-w-md font-normal leading-relaxed">
              Join the food court network. Receive live orders with sound alerts and direct UPI payments to your account.
            </p>
          </div>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold tracking-wide uppercase transition-colors shrink-0 cursor-pointer"
          >
            Apply to Join
          </button>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* 6. MINIMAL FOOTER */}
      {/* ----------------------------------------------------------------------- */}
      <footer className="mt-auto border-t border-white/[0.08] py-8 text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} PlazaBite OS. All rights reserved.</p>

          <div className="flex items-center gap-5 text-zinc-400">
            <Link href="/menu" className="hover:text-white transition-colors">Menu</Link>
            <Link href="/partner" className="hover:text-white transition-colors">Staff Portal</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Partner
            </button>
          </div>
        </div>
      </footer>

      {/* Register Stall Modal */}
      <RegisterCafeModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  )
}
