'use client'

import { useState, useEffect } from 'react'
import { verifyShopCredentials } from '@/lib/data'
import { BrandLogo } from '@/components/brand-logo'
import { initNativeNotifications } from '@/lib/native-notifications'
import { Phone, KeyRound, ArrowRight, ShieldCheck, ChefHat, Bell, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function PartnerPortalPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutTimer, setLockoutTimer] = useState(0)

  useEffect(() => {
    initNativeNotifications()

    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer(t => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [lockoutTimer])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockoutTimer > 0) {
      toast.error(`Too many attempts. Please wait ${lockoutTimer}s.`)
      return
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.')
      return
    }

    if (pin.length !== 4) {
      toast.error('Please enter your 4-digit secret PIN.')
      return
    }

    setIsVerifying(true)
    try {
      const result = await verifyShopCredentials(cleanPhone, pin)
      if (result.success && result.shop) {
        // Securely store authenticated session
        sessionStorage.setItem(
          'plazabite_shop_auth',
          JSON.stringify({
            shopId: result.shop.id,
            name: result.shop.name,
            phone: result.shop.phone,
            authenticatedAt: Date.now()
          })
        )
        localStorage.setItem('plazabite_partner_shop_id', result.shop.id)

        toast.success(`Authenticated: Welcome ${result.shop.name} Kitchen!`)
        router.push(`/shop/${result.shop.id}/dashboard`)
      } else {
        const nextFailed = failedAttempts + 1
        setFailedAttempts(nextFailed)
        if (nextFailed >= 4) {
          setLockoutTimer(30)
          toast.error('Account temporarily locked for 30s due to repeated failed attempts.')
        } else {
          toast.error(result.error || 'Invalid mobile number or PIN. Check with Plaza Admin.')
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Verification failed. Try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-6 pt-2 border-b border-slate-800">
        <BrandLogo size="md" subtitle="Kitchen & Partner Portal" className="text-white" />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Staff Mobile Mode</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md mx-auto w-full my-auto py-6">
        <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-[#E50914] flex items-center justify-center mx-auto mb-3 border border-red-500/30">
              <ChefHat size={30} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Staff Kitchen Login</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Enter your registered cafe mobile number and 4-digit PIN to access live kitchen orders.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Phone size={14} className="text-[#E50914]" />
                <span>Registered Mobile Number</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full h-12 pl-13 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 font-mono text-base font-bold focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* PIN Input */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <KeyRound size={14} className="text-[#E50914]" />
                <span>Secret 4-Digit Staff PIN</span>
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 text-center tracking-[0.5em] text-2xl font-bold focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              />
            </div>

            {/* Lockout Warning */}
            {lockoutTimer > 0 && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl flex items-center gap-2 text-xs text-red-300 font-medium">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <span>Temporarily locked. Retry in {lockoutTimer}s.</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying || lockoutTimer > 0}
              className="w-full h-12 rounded-2xl bg-[#E50914] hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Secure Kitchen Login</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper Hint */}
          <div className="mt-5 p-3 rounded-xl bg-slate-700/40 border border-slate-700 text-[11px] text-slate-400">
            <span className="font-bold text-slate-300 block mb-1">Demo Stalls Credentials:</span>
            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
              <div>Caffellon: 9876543210 (PIN: 1234)</div>
              <div>Brew & Beans: 9876543211 (PIN: 1234)</div>
              <div>Momo Haven: 9876543212 (PIN: 1234)</div>
              <div>Sweet Scoop: 9876543213 (PIN: 1234)</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Bell size={12} className="text-amber-400" /> High-Priority Chimes
            </span>
            <span>PlazaBite Partner OS</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-3">
        &copy; {new Date().getFullYear()} PlazaBite Partner. Designed for Food Plaza & Restaurant Kitchens.
      </footer>
    </div>
  )
}
