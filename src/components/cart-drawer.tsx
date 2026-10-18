'use client'

import { useCart } from '@/lib/cart-store'
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export function CartDrawer() {
  const {
    items,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    tableNumber,
    orderNotes,
    setOrderNotes
  } = useCart()

  const count = getItemCount()
  const total = getTotal()

  if (count === 0 && !isCartOpen) return null

  return (
    <>
      {/* PlazaBite Floating Bottom Cart Bar */}
      {count > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none animate-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full h-15 bg-[#E50914] hover:bg-red-700 text-white rounded-2xl shadow-xl shadow-red-500/30 flex items-center justify-between px-5 transition-all active:scale-[0.98] border border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-white" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#E50914] text-[11px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {count}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-white/80 block">
                    Table #{tableNumber || '4'}
                  </span>
                  <span className="text-lg font-black tracking-tight leading-none">
                    ₹{total}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
                <span>View Order</span>
                <ArrowRight size={14} />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* PlazaBite "Your Order" Modal Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Dialog Card matching PlazaBite */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#E50914] flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Your Order</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Table Notice */}
            <div className="my-3 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Serving at:</span>
              <span className="font-extrabold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                Table #{tableNumber}
              </span>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1 no-scrollbar">
              {items.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <ShoppingBag size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-sm">Your tray is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Add items from Caffellon or partner cafes!</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2.5 bg-slate-50/80 rounded-2xl border border-slate-100"
                  >
                    {/* Item Thumbnail */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ShoppingBag size={18} />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        ₹{item.price} / unit {item.shop_name && `• ${item.shop_name}`}
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-1 py-0.5 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-red-600 rounded-full active:scale-90"
                      >
                        {item.quantity === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                      </button>
                      <span className="w-4 text-center text-xs font-black text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-full active:scale-90"
                      >
                        <Plus size={12} strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Line price */}
                    <span className="text-sm font-black text-slate-900 w-12 text-right">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Special Instructions / Notes */}
            {items.length > 0 && (
              <div className="py-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Kitchen Notes & Requests (Optional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Extra spicy, less ice, no onions, extra napkins..."
                  maxLength={120}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#E50914] focus:ring-1 focus:ring-red-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            )}

            {/* Total Section matching PlazaBite */}
            {items.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-700">Total Price</span>
                  <span className="text-2xl font-black text-[#E50914]">₹{total}</span>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false)
                    setIsCheckoutOpen(true)
                  }}
                  className="w-full h-13 rounded-2xl bg-[#E50914] hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed to Checkout
                </button>

                <div className="text-center pt-1">
                  <button
                    onClick={clearCart}
                    className="text-xs font-extrabold text-slate-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
