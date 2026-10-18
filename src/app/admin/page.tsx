'use client'

import { useState, useEffect } from 'react'
import { getAdminStats, getAllShopsForAdmin, updateShopStatus, getFoodCourts, createFoodCourt } from '@/lib/data'
import { Shop, FoodCourt } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  Store, CheckCircle2, XCircle, Clock, IndianRupee, ShoppingBag, 
  Users, TrendingUp, AlertCircle, Phone, ArrowUpRight, ShieldCheck, 
  MapPin, RefreshCw, Plus, Lock, ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('plazabite_admin_auth')
      if (auth === 'true') {
        setIsAuthenticated(true)
      }
    }
  }, [])

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    const masterPin = process.env.NEXT_PUBLIC_ADMIN_PIN || '9999'
    if (pin === masterPin || pin === '9999') {
      sessionStorage.setItem('plazabite_admin_auth', 'true')
      setIsAuthenticated(true)
      setPinError(false)
      toast.success('SuperAdmin Portal Unlocked', { icon: '🛡️' })
    } else {
      setPinError(true)
      toast.error('Incorrect Master PIN. (Default demo PIN is 9999)')
    }
  }

  const handleLock = () => {
    sessionStorage.removeItem('plazabite_admin_auth')
    setIsAuthenticated(false)
    setPin('')
    toast.info('Admin portal locked')
  }

  const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([])
  const [selectedCourtId, setSelectedCourtId] = useState<string>('')
  const [shops, setShops] = useState<Shop[]>([])
  const [statsData, setStatsData] = useState({ totalRevenue: 0, totalOrders: 0, shopCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isNewCourtModalOpen, setIsNewCourtModalOpen] = useState(false)
  const [newCourtName, setNewCourtName] = useState('')
  const [newCourtCity, setNewCourtCity] = useState('')
  const [newCourtAddress, setNewCourtAddress] = useState('')
  const [newCourtTables, setNewCourtTables] = useState('20')
  const [isCreatingCourt, setIsCreatingCourt] = useState(false)

  const handleCreateFoodCourt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourtName.trim()) {
      toast.error('Please enter a food court name')
      return
    }
    try {
      setIsCreatingCourt(true)
      const created = await createFoodCourt({
        name: newCourtName.trim(),
        city: newCourtCity.trim() || 'Central',
        address: newCourtAddress.trim(),
        tables_count: parseInt(newCourtTables) || 20
      })
      if (created) {
        setFoodCourts(prev => [...prev, created])
        setSelectedCourtId(created.id)
        setIsNewCourtModalOpen(false)
        setNewCourtName('')
        setNewCourtCity('')
        setNewCourtAddress('')
        setNewCourtTables('20')
        toast.success(created.name + ' created successfully!')
      }
    } catch (err) {
      toast.error('Failed to create food court')
    } finally {
      setIsCreatingCourt(false)
    }
  }

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [courts, allShops, stats] = await Promise.all([
        getFoodCourts(),
        getAllShopsForAdmin(),
        getAdminStats()
      ])
      setFoodCourts(courts)
      if (courts.length > 0 && !selectedCourtId) {
        setSelectedCourtId(courts[0].id)
      }
      setShops(allShops)
      setStatsData(stats)
    } catch (err) {
      console.error('Failed to load admin data:', err)
      toast.error('Failed to load food court data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const handleApprove = async (shopId: string, shopName: string) => {
    try {
      await updateShopStatus(shopId, 'accepted')
      setShops(prev => prev.map(s => s.id === shopId ? { ...s, status: 'accepted' } : s))
      toast.success(`${shopName} approved! It is now active on the customer menu.`, {
        icon: '🎉'
      })
    } catch (err) {
      toast.error('Failed to approve vendor')
    }
  }

  const handleReject = async (shopId: string, shopName: string) => {
    try {
      await updateShopStatus(shopId, 'rejected')
      setShops(prev => prev.map(s => s.id === shopId ? { ...s, status: 'rejected' } : s))
      toast.info(`${shopName} request rejected.`)
    } catch (err) {
      toast.error('Failed to reject vendor')
    }
  }

  const currentCourt = foodCourts.find(c => c.id === selectedCourtId) || foodCourts[0]

  // Filter shops by current food court
  const courtShops = shops.filter(s => !selectedCourtId || s.food_court_id === selectedCourtId)
  const pendingShops = courtShops.filter(s => s.status === 'pending')
  const acceptedShops = courtShops.filter(s => s.status === 'accepted' || !s.status)

    if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-6">
        <header className="flex items-center justify-between pb-6 pt-2 border-b border-slate-800">
          <BrandLogo size="md" subtitle="SuperAdmin Security" className="text-white" />
          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>Exit to Menu</span>
            <ArrowUpRight size={13} />
          </Link>
        </header>

        <main className="max-w-sm mx-auto w-full my-auto py-8">
          <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-[#E50914] flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <ShieldCheck size={32} />
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white">SuperAdmin Portal</h1>
            <p className="text-xs text-slate-400 font-medium mt-1.5 mb-6">
              Enter your 4-digit Master Security PIN to access food court revenues, vendor governance, and venue settings.
            </p>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  required
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''))
                    if (pinError) setPinError(false)
                  }}
                  placeholder="• • • •"
                  className={`w-48 h-14 mx-auto text-center font-black text-3xl tracking-[0.4em] bg-slate-900 rounded-2xl border-2 text-white focus:outline-none transition-all block ${
                    pinError
                      ? 'border-red-500 focus:ring-4 focus:ring-red-500/20'
                      : 'border-slate-700 focus:border-[#E50914] focus:ring-4 focus:ring-red-500/20'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={pin.length < 4}
                className="w-full h-12 rounded-2xl bg-[#E50914] hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Unlock Platform Admin</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-500 block">
                Demo Master PIN: <strong className="text-amber-400 font-mono">9999</strong>
              </span>
            </div>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-500 py-3">
          &copy; {new Date().getFullYear()} PlazaBite OS. SuperAdmin Security Gateway.
        </footer>
      </div>
    )
  }

return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E50914] text-white flex items-center justify-center font-black">
              <Store size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">Food Court Admin</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Multi-Vendor Plaza Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold text-slate-600 hover:text-[#E50914] flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              <span>View Customer Menu</span>
              <ArrowUpRight size={14} />
            </Link>
            <button
              onClick={fetchData}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={handleLock}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Lock Portal"
            >
              <Lock size={16} />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Food Court Selector */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#E50914] block">Active Venue</span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{currentCourt?.name || 'Central Food Plaza'}</h2>
              <Badge variant="outline" className="text-xs border-slate-200">
                <MapPin size={11} className="mr-1 text-slate-400" />
                {currentCourt?.location || 'Central Location'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {foodCourts.map((court) => (
              <button
                key={court.id}
                onClick={() => setSelectedCourtId(court.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                  selectedCourtId === court.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {court.name}
              </button>
            ))}
            <button
              onClick={() => setIsNewCourtModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all bg-red-50 text-[#E50914] border border-red-200 hover:bg-red-100 flex items-center gap-1.5 shrink-0"
            >
              <Plus size={14} />
              <span>New Venue</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Sales</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">₹{statsData.totalRevenue}</span>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5 mt-1">
              <TrendingUp size={12} /> Combined revenue
            </span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Orders</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{statsData.totalOrders}</span>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Shared table orders</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Active Cafes</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{acceptedShops.length}</span>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Live kitchens in venue</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Pending Requests</span>
            <span className={`text-2xl font-black mt-1 block ${pendingShops.length > 0 ? 'text-[#E50914]' : 'text-slate-900'}`}>
              {pendingShops.length}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Awaiting your approval</span>
          </div>
        </div>

        {/* Section 1: Pending Shop Join Requests */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">Vendor Join Requests</h3>
              {pendingShops.length > 0 && (
                <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {pendingShops.length} Pending
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-medium">New cafes requesting to sell in this plaza</span>
          </div>

          {pendingShops.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 text-xs text-slate-400">
              No pending vendor requests at the moment.
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingShops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white p-5 rounded-3xl border-2 border-red-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center shrink-0">
                      <Store size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-base text-slate-900">{shop.name}</h4>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{shop.category}</p>
                      {shop.description && (
                        <p className="text-xs text-slate-600 mt-1 italic">&ldquo;{shop.description}&rdquo;</p>
                      )}
                      {shop.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                          <Phone size={12} />
                          <span>Phone: +91 {shop.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accept / Reject Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReject(shop.id, shop.name)}
                      className="px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(shop.id, shop.name)}
                      className="px-5 py-2.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={16} />
                      <span>Accept Vendor</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Active Approved Cafes */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black text-slate-900">Active Plaza Cafes ({acceptedShops.length})</h3>
            <span className="text-xs text-slate-400 font-medium">Currently serving customers at tables</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {acceptedShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      Active
                    </span>
                    <span className="text-xs font-bold text-amber-500">★ {shop.rating || 4.8}</span>
                  </div>
                  <h4 className="font-black text-base text-slate-900">{shop.name}</h4>
                  <p className="text-xs text-slate-500">{shop.category}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">PIN: {shop.pin || '1234'}</span>
                  <Link
                    href={`/shop/${shop.id}/dashboard`}
                    target="_blank"
                    className="text-xs font-black text-[#E50914] hover:underline flex items-center gap-1"
                  >
                    <span>Kitchen App</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Create Food Court Modal */}
        <Dialog open={isNewCourtModalOpen} onOpenChange={setIsNewCourtModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6 bg-white">
            <DialogHeader>
              <div className="w-12 h-12 bg-red-100 text-[#E50914] rounded-2xl flex items-center justify-center mb-2 mx-auto">
                <Store size={24} />
              </div>
              <DialogTitle className="text-center text-xl font-black">Create New Food Court</DialogTitle>
              <DialogDescription className="text-center text-xs text-slate-500">
                Register a new food court plaza or dining venue to manage partner stalls.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateFoodCourt} className="space-y-4 my-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Food Court / Plaza Name *</label>
                <input
                  type="text"
                  required
                  value={newCourtName}
                  onChange={(e) => setNewCourtName(e.target.value)}
                  placeholder="e.g. Marina Central Food Plaza"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City / Mall *</label>
                  <input
                    type="text"
                    required
                    value={newCourtCity}
                    onChange={(e) => setNewCourtCity(e.target.value)}
                    placeholder="e.g. South Wing Mall"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Number of Tables</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={newCourtTables}
                    onChange={(e) => setNewCourtTables(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={newCourtAddress}
                  onChange={(e) => setNewCourtAddress(e.target.value)}
                  placeholder="e.g. Floor 3, Food Plaza Avenue"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingCourt}
                className="w-full h-12 rounded-2xl bg-[#E50914] hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
              >
                {isCreatingCourt ? 'Creating...' : 'Create Food Court Venue'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
