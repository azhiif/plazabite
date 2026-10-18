'use client'

import { getOrdersByShop, updateOrderStatus as updateStatusInDb, getShop, verifyShopCredentials, updateShopPin, updateShopUpi } from '@/lib/data'
import { notifyNewOrder, initNativeNotifications } from '@/lib/native-notifications'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  Check, Clock, Phone, Table, User, ChevronRight, AlertCircle, 
  Volume2, VolumeX, MessageSquare, History, Utensils, CheckCircle2, 
  ChefHat, Sparkles, RefreshCw, ArrowUpRight, Settings, Lock, QrCode,
  KeyRound, Save, LogOut, ShieldCheck, Loader2, ArrowRight
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Order, Shop } from '@/lib/types'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import Image from 'next/image'

export default function ShopOrdersPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.shopId as string

  const [shop, setShop] = useState<Shop | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Security Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authPhone, setAuthPhone] = useState('')
  const [authPin, setAuthPin] = useState('')
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(false)

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<'upi' | 'pin'>('upi')
  const [upiIdInput, setUpiIdInput] = useState('')
  const [isSavingUpi, setIsSavingUpi] = useState(false)
  
  // PIN change state
  const [currentPinInput, setCurrentPinInput] = useState('')
  const [newPinInput, setNewPinInput] = useState('')
  const [confirmPinInput, setConfirmPinInput] = useState('')
  const [isSavingPin, setIsSavingPin] = useState(false)

  const lastOrderCountRef = useRef(0)

  // Check existing session
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('plazabite_shop_auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.shopId === shopId) {
          setIsAuthenticated(true)
        }
      }
    } catch {}
  }, [shopId])

  // Play a pleasant kitchen chime using Web Audio API
  const playKitchenChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(587.33, now) // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15) // A5

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(880, now + 0.15)
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35) // D6

      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc1.stop(now + 0.2)
      osc2.start(now + 0.15)
      osc2.stop(now + 0.8)
    } catch (e) {
      console.warn('Audio chime error:', e)
    }
  }

  const fetchOrders = async () => {
    try {
      const data = await getOrdersByShop(shopId)
      if (data.length > lastOrderCountRef.current && lastOrderCountRef.current > 0) {
        const latest = data[0]
        notifyNewOrder({
          orderId: latest?.id || '',
          tableNumber: latest?.table_number || 'Takeaway',
          shopName: shop?.name || 'Kitchen',
          itemsCount: latest?.items?.length || 1,
          totalAmount: latest?.total || 0
        })
        playKitchenChime()
        toast.info(`New Order Received! (#${latest?.id.slice(0, 6)})`, { icon: '🔔' })
      }
      lastOrderCountRef.current = data.length
      setOrders(data)
      setError(null)
    } catch (err: any) {
      console.error('Failed to load orders:', err)
      setError('Failed to load orders. Please refresh.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    async function loadShopInfo() {
      const s = await getShop(shopId)
      if (s) {
        setShop(s)
        setUpiIdInput(s.upi_id || 'caffellon@okhdfcbank')
      }
    }
    loadShopInfo()
    fetchOrders()

    let channel: any = null
    try {
      const supabase = createClient()
      channel = supabase
        .channel('shop-orders-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('Real-time order change:', payload)
            if (payload.eventType === 'INSERT') {
              playKitchenChime()
              toast.info('New Order Received!', { icon: '🔔' })
            }
            fetchOrders()
          }
        )
        .subscribe()
    } catch (e) {
      console.warn('Realtime subscription fallback:', e)
    }

    const interval = setInterval(fetchOrders, 5000)

    return () => {
      clearInterval(interval)
      if (channel) {
        try {
          const supabase = createClient()
          supabase.removeChannel(channel)
        } catch {}
      }
    }
  }, [shopId, soundEnabled])

  // Handle In-Dashboard Auth Unlock
  const handleUnlockAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifyingAuth(true)
    try {
      const cleanPhone = authPhone.replace(/\D/g, '')
      const res = await verifyShopCredentials(cleanPhone, authPin)
      if (res.success && res.shop) {
        if (res.shop.id === shopId) {
          sessionStorage.setItem('plazabite_shop_auth', JSON.stringify({
            shopId: res.shop.id,
            name: res.shop.name,
            phone: res.shop.phone,
            authenticatedAt: Date.now()
          }))
          setIsAuthenticated(true)
          toast.success(`Authenticated for ${res.shop.name}`)
        } else {
          toast.error('These credentials belong to a different cafe stall.')
        }
      } else {
        toast.error(res.error || 'Invalid Phone Number or PIN.')
      }
    } catch (err: any) {
      toast.error('Verification failed.')
    } finally {
      setIsVerifyingAuth(false)
    }
  }

  // Handle Logout / Lock
  const handleLogout = () => {
    sessionStorage.removeItem('plazabite_shop_auth')
    setIsAuthenticated(false)
    toast.info('Kitchen screen locked.')
    router.push('/partner')
  }

  // Handle UPI ID Save
  const handleSaveUpi = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!upiIdInput.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. yourshop@okhdfcbank)')
      return
    }
    setIsSavingUpi(true)
    try {
      const res = await updateShopUpi(shopId, upiIdInput)
      if (res.success) {
        toast.success(res.message)
        setShop(prev => prev ? { ...prev, upi_id: upiIdInput.trim() } : prev)
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update UPI ID.')
    } finally {
      setIsSavingUpi(false)
    }
  }

  // Handle PIN Change Save
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPinInput.length !== 4) {
      toast.error('New PIN must be exactly 4 digits.')
      return
    }
    if (newPinInput !== confirmPinInput) {
      toast.error('New PIN and confirmation PIN do not match.')
      return
    }
    setIsSavingPin(true)
    try {
      const res = await updateShopPin(shopId, currentPinInput, newPinInput)
      if (res.success) {
        toast.success(res.message)
        setCurrentPinInput('')
        setNewPinInput('')
        setConfirmPinInput('')
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update PIN.')
    } finally {
      setIsSavingPin(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, status: Order['order_status']) => {
    try {
      await updateStatusInDb(orderId, status)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: status } : o))
      toast.success(`Order marked as ${status}`)
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error('Failed to update status')
    }
  }

  const liveOrders = orders.filter(o => o.order_status === 'Pending' || o.order_status === 'Preparing' || o.order_status === 'Ready')
  const historyOrders = orders.filter(o => o.order_status === 'Completed' || o.order_status === 'Delivered')
  const currentList = activeTab === 'live' ? liveOrders : historyOrders

  const getStatusBadge = (status: Order['order_status']) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
      case 'Preparing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Preparing</Badge>
      case 'Ready':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Ready to Serve</Badge>
      case 'Completed':
      case 'Delivered':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Delivered</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // --- 1. RENDER AUTH LOCK SCREEN IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4">
        <div className="bg-slate-800/90 border border-slate-700 max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-[#E50914] flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-black text-white">Kitchen Display Locked</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Please enter the registered staff mobile number and 4-digit PIN for {shop?.name || 'this stall'}.
          </p>

          <form onSubmit={handleUnlockAuth} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Phone size={13} className="text-[#E50914]" />
                <span>Registered Mobile Number</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                required
                autoFocus
                value={authPhone}
                onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:border-red-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <KeyRound size={13} className="text-[#E50914]" />
                <span>4-Digit Staff PIN</span>
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={authPin}
                onChange={(e) => setAuthPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-center tracking-[0.4em] font-bold text-xl focus:border-red-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingAuth}
              className="w-full h-11 rounded-xl bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isVerifyingAuth ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              <span>Unlock Kitchen Screen</span>
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-700/60">
            <button
              onClick={() => router.push('/partner')}
              className="text-xs text-slate-400 hover:text-white transition-colors underline"
            >
              ← Return to Partner Portal
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- 2. RENDER MAIN AUTHENTICATED KITCHEN DASHBOARD ---
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#E50914] bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
              {shop?.name || 'Kitchen Dashboard'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Food Plaza KOT System</span>
            {shop?.upi_id && (
              <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                UPI: {shop.upi_id}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Kitchen Orders & Dispatch
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Live orders for shared dining hall tables with audio alerts and customer notes.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled)
              if (!soundEnabled) playKitchenChime()
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-colors ${
              soundEnabled
                ? 'bg-red-50 text-[#E50914] border-red-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Chime Active' : 'Muted'}</span>
          </button>

          {/* Shop Settings (UPI & PIN) */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Shop UPI & PIN Settings"
          >
            <Settings size={15} />
            <span className="hidden sm:inline">Shop Settings</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={fetchOrders}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh Orders"
          >
            <RefreshCw size={16} />
          </button>

          {/* Lock / Logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 transition-colors shadow-2xs"
            title="Lock Kitchen Display"
          >
            <Lock size={15} />
          </button>
        </div>
      </header>

      {/* Tabs: Live Orders vs Order History */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all ${
              activeTab === 'live'
                ? 'bg-[#E50914] text-white shadow-md shadow-red-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ChefHat size={16} />
            <span>Live Kitchen Orders</span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'live' ? 'bg-white text-[#E50914]' : 'bg-red-100 text-red-700'
            }`}>
              {liveOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <History size={16} />
            <span>Order History</span>
            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {historyOrders.length}
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Auto-updates every 5s • Real-time
        </span>
      </div>

      {/* Order Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw size={18} className="animate-spin text-slate-400" />
            <span>Connecting to live orders feed...</span>
          </div>
        ) : currentList.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 rounded-3xl bg-slate-50/50">
            <CardContent className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
                {activeTab === 'live' ? <ChefHat size={28} /> : <History size={28} />}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">
                  {activeTab === 'live' ? 'No active orders in queue' : 'No order history yet'}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  {activeTab === 'live'
                    ? 'Orders placed via table QR codes or self-pickup counter will chime here instantly.'
                    : 'Completed and delivered food orders will be archived in this view.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          currentList.map((order) => {
            const timeAgo = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const orderItems = order.items && order.items.length > 0 ? order.items : (order.order_items || [])
            const isTakeaway = !order.table_number || Number(order.table_number) === 0 || order.dining_option === 'takeaway'

            return (
              <Card
                key={order.id}
                className={cn(
                  'rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md',
                  order.order_status === 'Pending' ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 bg-white'
                )}
              >
                <CardContent className="p-4 sm:p-6 space-y-4">
                  {/* Top Line: Table / Token Badge + ID + Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      {/* Prominent Table or Token Badge */}
                      {isTakeaway ? (
                        <div className="flex items-center gap-1.5 bg-purple-700 text-white px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-xs">
                          <Utensils size={15} />
                          <span>TOKEN #{order.id.slice(0, 4).toUpperCase()} (COUNTER PICKUP)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-[#E50914] text-white px-3 py-1.5 rounded-xl font-black text-sm shadow-xs">
                          <Table size={16} />
                          <span>TABLE #{order.table_number}</span>
                        </div>
                      )}
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" /> {timeAgo}
                      </span>
                      {order.payment_status === 'Paid' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-xs">
                          <Check size={11} className="stroke-[3]" /> UPI Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                          Pay at Counter
                        </span>
                      )}
                      {getStatusBadge(order.order_status)}
                    </div>
                  </div>

                  {/* Customer Info & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-700">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                        <User size={14} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Customer</span>
                        <span className="font-extrabold text-slate-900">{order.customer_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 text-slate-700">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block text-right">Phone</span>
                        <span className="font-bold text-slate-800">+91 {order.phone || order.customer_phone}</span>
                      </div>
                      <a
                        href={`tel:${order.phone || order.customer_phone}`}
                        className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700"
                        title="Call Customer"
                      >
                        <Phone size={14} />
                      </a>
                    </div>
                  </div>

                  {/* Special Kitchen Notes (Highlighted if present) */}
                  {order.notes && (
                    <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs">
                      <MessageSquare size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black text-amber-900 text-[11px] uppercase tracking-wider block">
                          Customer Request / Instructions:
                        </span>
                        <p className="text-amber-950 font-semibold mt-0.5">{order.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Items Breakdown */}
                  <div className="space-y-1.5 py-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kitchen Items ({orderItems.length})
                    </span>
                    <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-100 overflow-hidden">
                      {orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-red-50 text-[#E50914] font-black flex items-center justify-center text-xs">
                              {item.quantity}x
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                              {item.name || item.item_name}
                            </span>
                          </div>
                          <span className="font-extrabold text-slate-700">
                            ₹{(item.price || 0) * (item.quantity || 1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Line: Total + Status Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold uppercase">Total Bill:</span>
                      <span className="text-lg font-black text-slate-900">₹{order.total}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        order.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>

                    {/* Status Action Buttons for Kitchen */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {order.order_status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                          className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                        >
                          Start Preparing
                        </button>
                      )}

                      {order.order_status === 'Preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'Ready')}
                          className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                        >
                          {isTakeaway ? 'Ready for Counter Pickup' : 'Ready to Serve'}
                        </button>
                      )}

                      {order.order_status === 'Ready' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'Completed')}
                          className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                        >
                          {isTakeaway ? 'Handed Over to Customer' : 'Delivered to Table'}
                        </button>
                      )}

                      {order.order_status === 'Completed' && (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                          <CheckCircle2 size={16} /> Order Completed
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* --- 3. SHOP SETTINGS DIALOG (DIRECT UPI & PIN RESET) --- */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#E50914] flex items-center justify-center mx-auto mb-2">
              <Settings size={24} />
            </div>
            <DialogTitle className="text-center text-xl font-black text-slate-900">
              {shop?.name || 'Cafe'} Stall Settings
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Manage direct UPI bank payments and secret 4-digit staff PIN.
            </DialogDescription>
          </DialogHeader>

          {/* Settings Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl my-2">
            <button
              onClick={() => setSettingsTab('upi')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                settingsTab === 'upi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <QrCode size={14} className="text-[#E50914]" />
              <span>Direct Shop UPI</span>
            </button>
            <button
              onClick={() => setSettingsTab('pin')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                settingsTab === 'pin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <KeyRound size={14} className="text-[#E50914]" />
              <span>Change Staff PIN</span>
            </button>
          </div>

          {/* Tab 1: UPI ID Setup */}
          {settingsTab === 'upi' && (
            <form onSubmit={handleSaveUpi} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Shop Merchant UPI ID (VPA)
                </label>
                <input
                  type="text"
                  required
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder="e.g. caffellon@okhdfcbank"
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:border-red-500 outline-none"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  All customer payments for this stall go directly to this bank account (0% commission).
                </span>
              </div>

              {/* Live Dynamic QR Test Preview */}
              {upiIdInput.includes('@') && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                    Live QR Test Preview
                  </span>
                  <div className="inline-block p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                        'upi://pay?pa=' + upiIdInput.trim() + '&pn=' + encodeURIComponent(shop?.name || 'Cafe') + '&am=1&cu=INR'
                      )}`}
                      alt="UPI QR Preview"
                      className="w-28 h-28 mx-auto"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {upiIdInput}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingUpi}
                className="w-full h-11 rounded-2xl bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSavingUpi ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Save Merchant UPI ID</span>
              </button>
            </form>
          )}

          {/* Tab 2: Change PIN */}
          {settingsTab === 'pin' && (
            <form onSubmit={handleSavePin} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Current 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Current PIN (Default: 1234)"
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-center tracking-[0.4em] font-bold text-lg text-slate-900 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  New 4-Digit Secret PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-center tracking-[0.4em] font-bold text-lg text-slate-900 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-center tracking-[0.4em] font-bold text-lg text-slate-900 focus:border-red-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingPin}
                className="w-full h-11 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSavingPin ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                <span>Update Secret PIN</span>
              </button>
            </form>
          )}

          {/* Stall Registered Info */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Registered Phone: +91 {shop?.phone || '9876543210'}</span>
            <button
              onClick={() => {
                setIsSettingsOpen(false)
                handleLogout()
              }}
              className="text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <LogOut size={12} />
              <span>Lock Screen</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
