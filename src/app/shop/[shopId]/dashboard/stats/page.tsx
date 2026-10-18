'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { getShop, getOrdersByShop } from '@/lib/data'
import { Shop, Order } from '@/lib/types'
import { 
  TrendingUp, IndianRupee, ShoppingBag, Utensils, CheckCircle2, 
  Clock, Calendar, ArrowUpRight, Flame, Store, Sparkles, 
  Layers, Coffee, AlertCircle, RefreshCw
} from 'lucide-react'

export default function ShopStatsPage() {
  const params = useParams()
  const shopId = params.shopId as string

  const [shop, setShop] = useState<Shop | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [timeframe, setTimeframe] = useState<'today' | '7d' | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [shopData, ordersData] = await Promise.all([
        getShop(shopId),
        getOrdersByShop(shopId)
      ])
      if (shopData) setShop(shopData)
      setOrders(ordersData || [])
    } catch (err) {
      console.error('Failed to load shop stats data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [shopId])

  // Filter orders by selected timeframe
  const filteredOrders = useMemo(() => {
    const now = new Date()
    return orders.filter(o => {
      if (!o.created_at) return true
      const orderDate = new Date(o.created_at)
      if (timeframe === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        )
      }
      if (timeframe === '7d') {
        const diffMs = now.getTime() - orderDate.getTime()
        const diffDays = diffMs / (1000 * 60 * 60 * 24)
        return diffDays <= 7
      }
      return true
    })
  }, [orders, timeframe])

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    const completedOrders = filteredOrders.filter(o => 
      o.order_status === 'Ready' || o.order_status === 'Completed' || o.order_status === 'Delivered'
    ).length
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    // Item sales map
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>()
    let totalItemsSold = 0
    let dineInCount = 0
    let takeawayCount = 0

    filteredOrders.forEach(o => {
      if (o.dining_option === 'dine_in') dineInCount++
      else takeawayCount++

      const items = o.items || []
      items.forEach(item => {
        const qty = Number(item.quantity || 1)
        const price = Number(item.price || 0)
        totalItemsSold += qty
        const existing = itemMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 }
        existing.quantity += qty
        existing.revenue += (price * qty)
        itemMap.set(item.name, existing)
      })
    })

    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      aov,
      totalItemsSold,
      topItems,
      dineInCount,
      takeawayCount,
      dineInPercent: totalOrders > 0 ? Math.round((dineInCount / totalOrders) * 100) : 50
    }
  }, [filteredOrders])

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-3xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28 md:pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#E50914] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
              <Sparkles size={11} /> Analytics & Performance
            </span>
            <span className="text-xs font-bold text-slate-400">
              • {shop?.name || 'Cafe Outlet'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Kitchen Sales & Stats
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor real-time revenue, guest dining preferences, and best-selling dishes.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-center">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeframe === 'today'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeframe === '7d'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeframe === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Revenue
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-center">
              <span>₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
              <TrendingUp size={11} /> 100% direct shop settlement
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center font-black shrink-0">
            <IndianRupee size={22} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Orders Processed
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.totalOrders}
            </div>
            <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
              {stats.completedOrders} completed successfully
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Average Order Value
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{stats.aov}
            </div>
            <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
              Per dining guest ticket
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
            <ArrowUpRight size={22} />
          </div>
        </div>

        {/* Items Sold */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Dishes Prepared
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.totalItemsSold}
            </div>
            <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
              Across all categories
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
            <Utensils size={22} />
          </div>
        </div>
      </div>

      {/* Grid: Top Selling Items + Dining Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Items (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Flame size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Top Selling Dishes
                </h3>
                <p className="text-[11px] text-slate-500">Most ordered items by customer volume</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              Ranked by quantity
            </span>
          </div>

          {stats.topItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No dish sales recorded for this timeframe.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {stats.topItems.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {item.quantity} portions served
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 block">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600">
                      revenue generated
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dining Mode & Operations Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              Order Type Breakdown
            </h3>
            <p className="text-[11px] text-slate-500">Dine-in vs Counter Pickup preferences</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Dine-In ({stats.dineInCount})</span>
              <span>Takeaway ({stats.takeawayCount})</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div 
                className="bg-[#E50914] h-full transition-all duration-500" 
                style={{ width: `${stats.dineInPercent}%` }} 
              />
              <div 
                className="bg-amber-400 h-full transition-all duration-500" 
                style={{ width: `${100 - stats.dineInPercent}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>{stats.dineInPercent}% Food Court Table</span>
              <span>{100 - stats.dineInPercent}% Self Pickup</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Outlet Status
            </h4>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Average Preparation:</span>
              <span className="font-bold text-slate-900">{shop?.estimated_time || '15 mins'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Live Kitchen:</span>
              <span className={`font-bold ${shop?.is_open !== false ? 'text-emerald-600' : 'text-rose-500'}`}>
                {shop?.is_open !== false ? '● Open & Receiving' : '○ Paused'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Shop Direct UPI:</span>
              <span className="font-mono font-bold text-slate-700 text-[11px]">
                {shop?.upi_id || 'Configured in Settings'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Stream */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              Recent Order History
            </h3>
            <p className="text-[11px] text-slate-500">Recent customer transactions for this cafe</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No orders found for this timeframe.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Order / Token</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Seating</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      #{order.id.slice(0, 6)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{order.customer_name || 'Guest'}</span>
                      <span className="text-[10px] text-slate-400">{order.phone || ''}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {order.dining_option === 'dine_in'
                        ? `Table #${order.table_number || '4'}`
                        : 'Takeaway'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {(order.items || []).map(i => `${i.name} (${i.quantity})`).join(', ') || '1 Item'}
                    </td>
                    <td className="py-3 px-3 font-black text-slate-900">
                      ₹{order.total}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.order_status === 'Ready' || order.order_status === 'Completed' || order.order_status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
