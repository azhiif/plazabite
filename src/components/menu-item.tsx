'use client'

import Image from 'next/image'
import { Plus, Minus, Star, Utensils } from 'lucide-react'
import { Item } from '@/lib/types'
import { useCart } from '@/lib/cart-store'
import { Badge } from '@/components/ui/badge'

export function MenuItem({ item }: { item: Item }) {
  const { items, addItem, updateQuantity } = useCart()
  const cartItem = items.find((i) => i.id === item.id)
  const quantity = cartItem?.quantity || 0

  return (
    <div className="group relative bg-white p-3.5 sm:p-4 rounded-3xl shadow-xs hover:shadow-md border border-slate-100 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-200">
      {/* Food Photo Container */}
      <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-inner">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 96px, 110px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-300">
            <Utensils size={28} />
          </div>
        )}

        {/* Veg / Non-Veg Indicator badge in corner of image */}
        <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-md shadow-xs">
          <div
            className={`w-2.5 h-2.5 rounded-full border ${
              item.is_veg
                ? 'bg-green-600 border-green-700'
                : 'bg-red-600 border-red-700'
            }`}
          />
        </div>

        {/* Unavailable overlay */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-1">
            <span className="text-[10px] font-black uppercase text-white bg-red-600 px-1.5 py-0.5 rounded">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight truncate">
            {item.name}
          </h4>
          {item.tag && (
            <span className="text-[9px] font-black uppercase bg-red-50 text-[#E50914] border border-red-200 px-1.5 py-0.2 rounded-md">
              {item.tag}
            </span>
          )}
        </div>

        {/* Cafe origin & rating */}
        <div className="flex items-center gap-2 mb-1">
          {item.shop_name && (
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {item.shop_name}
            </span>
          )}
          <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
            <Star size={12} className="fill-current text-amber-400" />
            <span>{item.rating || 4.8}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
          {item.description || 'Freshly prepared to order with authentic spices.'}
        </p>

        {/* Price */}
        <div className="mt-2 flex items-center gap-1 font-black text-slate-900 text-base sm:text-lg">
          <span className="text-xs font-bold text-slate-500">₹</span>
          <span>{item.price}</span>
        </div>
      </div>

      {/* Add Button / Counter - Matches PlazaBite Circular Red Plus */}
      <div className="shrink-0">
        {quantity > 0 ? (
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full p-1 shadow-xs">
            <button
              onClick={() => updateQuantity(item.id, quantity - 1)}
              aria-label="Decrease quantity"
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white text-[#E50914] rounded-full shadow-xs active:scale-90 hover:bg-slate-50 transition-all"
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>
            <span className="w-5 text-center text-xs sm:text-sm font-black text-[#E50914]">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, quantity + 1)}
              aria-label="Increase quantity"
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#E50914] text-white rounded-full shadow-xs active:scale-90 hover:bg-red-700 transition-all"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addItem(item)}
            disabled={!item.is_available}
            aria-label={`Add ${item.name}`}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#E50914] hover:bg-red-700 disabled:bg-slate-200 text-white flex items-center justify-center shadow-md shadow-red-500/20 active:scale-90 transition-all cursor-pointer"
          >
            <Plus size={20} strokeWidth={2.6} />
          </button>
        )}
      </div>
    </div>
  )
}
