'use client'

import { Shop } from '@/lib/types'
import { Utensils, Star, Store } from 'lucide-react'

interface CafeFilterProps {
  shops: Shop[]
  selectedShopId: string | null
  onSelectShop: (shopId: string | null) => void
}

export function CafeFilter({ shops, selectedShopId, onSelectShop }: CafeFilterProps) {
  return (
    <div className="my-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-slate-800">
          <Store size={16} className="text-[#E50914]" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider">Food Plaza Outlets</h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          {shops.length} kitchens open
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
        {/* All Cafes button */}
        <button
          onClick={() => onSelectShop(null)}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
            selectedShopId === null
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100'
          }`}
        >
          <Utensils size={14} />
          <span>All Cafes</span>
        </button>

        {/* Individual Shops */}
        {shops.map((shop) => {
          const isSelected = selectedShopId === shop.id
          return (
            <button
              key={shop.id}
              onClick={() => onSelectShop(shop.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                isSelected
                  ? 'bg-[#E50914] text-white border-[#E50914] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span>{shop.name}</span>
              {shop.rating && (
                <span className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  <Star size={10} className="fill-current" />
                  {shop.rating}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
