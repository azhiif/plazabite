'use client'

import { useState } from 'react'
import { Search, MapPin, Menu, X, Bell, PhoneCall, History, Sparkles, Check, Store, Shield, QrCode } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { RegisterCafeModal } from '@/components/register-cafe-modal'
import { toast } from 'sonner'
import Link from 'next/link'

interface HeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeCafeName?: string
}

export function PlazaHeader({ searchQuery, setSearchQuery, activeCafeName }: HeaderProps) {
  const { tableNumber, setTableNumber } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState(String(tableNumber || '4'))

  const tables = Array.from({ length: 20 }, (_, i) => String(i + 1))

  const handleSaveTable = () => {
    setTableNumber(selectedTable)
    setIsTableModalOpen(false)
    toast.success(`Seating set to Table ${selectedTable}`)
  }

  const handleCallWaiter = () => {
    toast.success(`Server notified for Table ${tableNumber}! Someone will assist you shortly.`, {
      icon: '🔔'
    })
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-2.5">
        {/* Top brand & actions line */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Menu Drawer Toggle */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="p-2 -ml-2 text-slate-700 hover:text-black hover:bg-slate-100 rounded-full transition-colors active:scale-95"
          >
            <Menu size={22} strokeWidth={2.2} />
          </button>

          {/* Center Brand Title */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <span className="text-2xl font-black tracking-tighter text-[#E50914] uppercase drop-shadow-xs font-heading">
                {activeCafeName || 'PLAZABITE'}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-red-100 text-[#E50914] tracking-wide">
                {activeCafeName ? 'MENU' : 'PLAZA'}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest -mt-0.5">
              {activeCafeName ? 'Direct Table Service' : 'Multi-Cafe Shared Dining'}
            </span>
          </div>

          {/* Table Pill / Selector */}
          <button
            onClick={() => setIsTableModalOpen(true)}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200/80 text-[#E50914] px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-xs"
          >
            <MapPin size={14} className="text-[#E50914] animate-pulse" />
            <span className="text-xs font-extrabold tracking-tight">Table {tableNumber || '4'}</span>
          </button>
        </div>

        {/* Search Bar matching modern mobile app */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food, drink, desserts, cafes..."
            className="w-full h-11 pl-10 pr-10 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium rounded-full border border-transparent focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Slide-out Navigation Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMenuOpen(false)} 
          />
          <div className="relative z-10 w-4/5 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-[#E50914] tracking-tight">CAFFELLON</span>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Plaza</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="py-4 border-b border-slate-100">
                <div className="p-3 bg-red-50/70 border border-red-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">Your Table</span>
                    <span className="text-lg font-black text-slate-900">Table #{tableNumber}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsTableModalOpen(true)
                    }}
                    className="text-xs font-bold text-red-600 underline"
                  >
                    Change
                  </button>
                </div>
              </div>

              <nav className="py-4 space-y-2">
                <button 
                  onClick={handleCallWaiter}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-slate-800 font-semibold text-sm transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                    <Bell size={16} />
                  </div>
                  <span>Call Waiter / Service</span>
                </button>

                <a 
                  href="tel:+919876543210"
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-slate-800 font-semibold text-sm transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                    <PhoneCall size={16} />
                  </div>
                  <span>Contact Plaza Support</span>
                </a>

                <div 
                  onClick={() => {
                    setIsMenuOpen(false)
                    toast.info('Orders are tracked live via bottom cart status.')
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-slate-800 font-semibold text-sm transition-colors text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                    <History size={16} />
                  </div>
                  <span>Order Status & History</span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                    For Businesses & Owners
                  </span>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsRegisterModalOpen(true)
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-slate-800 font-semibold text-sm transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                      <Store size={16} />
                    </div>
                    <div>
                      <span className="block font-bold">Partner Cafe Request</span>
                      <span className="text-[11px] text-slate-400 font-normal">Join this food court</span>
                    </div>
                  </button>

                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Shield size={16} />
                    </div>
                    <div>
                      <span className="block font-bold">Food Court Owner Admin</span>
                      <span className="text-[11px] text-slate-400 font-normal">Manage vendors & accept requests</span>
                    </div>
                  </Link>

                  <Link
                    href="/shop/11111111-1111-1111-1111-111111111111/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <span className="block font-bold">Caffellon Kitchen Live</span>
                      <span className="text-[11px] text-slate-400 font-normal">View incoming orders & sound</span>
                    </div>
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-50 text-[#E50914] flex items-center justify-center">
                      <QrCode size={16} />
                    </div>
                    <div>
                      <span className="block font-bold">PlazaBite Platform Home</span>
                      <span className="text-[11px] text-slate-400 font-normal">Platform overview & features</span>
                    </div>
                  </Link>
                </div>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
              <p className="font-medium">Shared Dining Hall Service</p>
              <p className="text-[10px] mt-0.5">Powered by PlazaBite</p>
            </div>
          </div>
        </div>
      )}

      {/* Register Cafe Request Modal */}
      <RegisterCafeModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      {/* Table Change Modal */}
      <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <div className="w-12 h-12 bg-red-100 text-[#E50914] rounded-2xl flex items-center justify-center mb-2 mx-auto">
              <MapPin size={24} />
            </div>
            <DialogTitle className="text-center text-xl font-black">Select Your Table</DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Please choose the table number where you are seated so orders are served directly to you.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-5 gap-2 my-4 max-h-56 overflow-y-auto p-1">
            {tables.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTable(t)}
                className={`h-11 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                  selectedTable === t
                    ? 'bg-[#E50914] text-white shadow-md scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleSaveTable}
            className="w-full h-12 rounded-2xl bg-[#E50914] hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Check size={18} /> Confirm Table {selectedTable}
          </button>
        </DialogContent>
      </Dialog>
    </header>
  )
}
