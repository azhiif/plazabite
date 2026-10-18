'use client'

import { useCart } from '@/lib/cart-store'
import { CheckCircle2, Clock, ChefHat, Bell, X, MapPin, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export function OrderTrackingModal() {
  const { lastOrder, setLastOrder } = useCart()

  if (!lastOrder) return null

  const handleCallServer = () => {
    toast.success(`Server notified for Table ${lastOrder.table_number || '4'}!`, {
      icon: '🔔'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => setLastOrder(null)}
      />

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setLastOrder(null)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Celebration icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 size={36} strokeWidth={2.3} />
        </div>

        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order Placed!</h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Your food is being prepared and will be delivered straight to your table.
        </p>

        {/* Seating Highlight Card */}
        <div className="my-4 p-3.5 bg-red-50/80 rounded-2xl border border-red-100 flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E50914] text-white flex items-center justify-center font-black text-sm shadow-xs">
              <MapPin size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block">Delivery Spot</span>
              <span className="text-base font-black text-slate-900">Table #{lastOrder.table_number || '4'}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Est. Time</span>
            <span className="text-xs font-black text-slate-800 flex items-center gap-1 justify-end">
              <Clock size={12} className="text-amber-500" /> 12-15 mins
            </span>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="my-5 space-y-3 text-left">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live Kitchen Status</span>
          
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
              <div className="w-0.5 h-7 bg-green-600" />
            </div>
            <div className="pt-0.5">
              <h5 className="text-xs font-bold text-slate-900">Order Received by Kitchens</h5>
              <p className="text-[11px] text-slate-500">Tickets generated for {lastOrder.shop_name || 'Plaza Kitchens'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-[#E50914] text-white flex items-center justify-center animate-pulse">
                <ChefHat size={14} />
              </div>
              <div className="w-0.5 h-7 bg-slate-200" />
            </div>
            <div className="pt-0.5">
              <h5 className="text-xs font-bold text-[#E50914]">Preparing Your Dishes</h5>
              <p className="text-[11px] text-slate-500">Freshly rolling & tossing your items</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
              <MapPin size={12} />
            </div>
            <div className="pt-0.5">
              <h5 className="text-xs font-bold text-slate-400">Serving to Table #{lastOrder.table_number || '4'}</h5>
              <p className="text-[11px] text-slate-400">Server will deliver hot to your seating</p>
            </div>
          </div>
        </div>

        {/* Ordered Items Summary */}
        {lastOrder.items && lastOrder.items.length > 0 && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left my-4 max-h-36 overflow-y-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Order Items ({lastOrder.items.length})
            </span>
            <div className="space-y-1">
              {lastOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800 truncate mr-2">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-black text-slate-900 shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between font-black text-xs text-slate-900">
              <span>Total Paid / Payable</span>
              <span className="text-[#E50914]">₹{lastOrder.total}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleCallServer}
            className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Bell size={14} className="text-[#E50914]" />
            <span>Call Server</span>
          </button>

          <button
            onClick={() => setLastOrder(null)}
            className="flex-1 h-12 rounded-2xl bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98]"
          >
            Order More
          </button>
        </div>
      </div>
    </div>
  )
}
