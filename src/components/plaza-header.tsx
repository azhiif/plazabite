'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, MapPin, MoreVertical, X, Bell, PhoneCall, History, Sparkles, Check, Store, Shield, QrCode, ChevronRight } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { RegisterCafeModal } from '@/components/register-cafe-modal'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

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
  const [mounted, setMounted] = useState(false)

  const tables = Array.from({ length: 20 }, (_, i) => String(i + 1))

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent background scrolling when options drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

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
          {/* Top-Left 3-Dots Options Trigger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Options menu"
            className="w-9 h-9 -ml-1 text-slate-700 hover:text-black hover:bg-slate-100 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Options"
          >
            <MoreVertical size={20} strokeWidth={2.4} />
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
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200/80 text-[#E50914] px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-xs cursor-pointer"
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
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Slide-out Navigation Drawer / Options Menu portaled directly to body to avoid backdrop-blur containment */}
      {isMenuOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer" 
            onClick={() => setIsMenuOpen(false)} 
          />

          {/* Drawer Panel */}
          <div className="relative z-10 w-[85vw] max-w-xs sm:max-w-sm bg-white h-screen max-h-screen shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-200 border-r border-slate-200">
            {/* Drawer Header */}
            <div className="bg-[#0A0C10] text-white p-4.5 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <Image src="/images/logo.png" alt="PlazaBite" fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black tracking-tight text-white uppercase font-heading">
                      {activeCafeName || 'PLAZABITE'}
                    </span>
                    <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      {activeCafeName ? 'Cafe' : 'Plaza'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-normal">
                    {activeCafeName ? 'Direct Table Service' : 'Multi-Cafe Shared Dining'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close options"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
              {/* Seating / Table Card */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center font-bold">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Table</span>
                    <span className="text-base font-black text-slate-900">Table #{tableNumber || '4'}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsTableModalOpen(true)
                  }}
                  className="text-xs font-bold text-[#E50914] hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Change Table
                </button>
              </div>

              {/* Guest Services */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
                  Guest Dining Services
                </span>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-xs">
                  <button 
                    onClick={handleCallWaiter}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center shrink-0">
                        <Bell size={16} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-[#E50914] transition-colors">Call Waiter / Service</span>
                        <span className="text-[11px] text-slate-500">Notify floor staff to Table #{tableNumber || '4'}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>

                  <a 
                    href="tel:+919876543210"
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <PhoneCall size={16} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-[#E50914] transition-colors">Contact Plaza Support</span>
                        <span className="text-[11px] text-slate-500">Help desk & payment inquiries</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </a>

                  <div 
                    onClick={() => {
                      setIsMenuOpen(false)
                      toast.info('Active orders are tracked live at the bottom cart drawer.')
                    }}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <History size={16} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-[#E50914] transition-colors">Order Status & History</span>
                        <span className="text-[11px] text-slate-500">Track kitchen preparation & KOT</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Kitchen & Platform Portals */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
                  Kitchen & Management
                </span>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-xs">
                  <Link
                    href="/partner"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-[#E50914] transition-colors">Kitchen Staff Login</span>
                        <span className="text-[11px] text-slate-500">Access kitchen order screen</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <Shield size={16} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-[#E50914] transition-colors">Food Court Admin</span>
                        <span className="text-[11px] text-slate-500">Manage outlets & table QR codes</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsRegisterModalOpen(true)
                    }}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center shrink-0">
                        <Store size={16} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-[#E50914] transition-colors">Partner Cafe Application</span>
                        <span className="text-[11px] text-slate-500">Apply to list in this food court</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>

                  <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <QrCode size={16} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-[#E50914] transition-colors">PlazaBite Platform Home</span>
                        <span className="text-[11px] text-slate-500">Overview, install app & features</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-white text-xs text-slate-400 text-center shrink-0">
              <p className="font-semibold text-slate-600">PlazaBite Food Court System</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Direct Table Service • Zero Commission</p>
            </div>
          </div>
        </div>,
        document.body
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
