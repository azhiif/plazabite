'use client'

import Image from 'next/image'

interface CategoryRailProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

// Map categories to high-quality circular thumbnail images
const CATEGORY_IMAGES: Record<string, string> = {
  'ALL': '',
  'Caffellon Rolls': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=160&h=160&q=80',
  'Loaded Fries': 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=160&h=160&q=80',
  'Smash Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=160&h=160&q=80',
  'Tenders & Wings': 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=160&h=160&q=80',
  'Momos': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=160&h=160&q=80',
  'Mojitos & Coolers': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=160&h=160&q=80',
  'Shakes & Coffee': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=160&h=160&q=80',
  'Desserts & Waffles': 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=160&h=160&q=80',
}

export function CategoryRail({ categories, selectedCategory, onSelectCategory }: CategoryRailProps) {
  return (
    <div className="py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
      <div className="flex items-start gap-4 px-1 min-w-max">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat
          const isAll = cat === 'ALL'
          const imgUrl = CATEGORY_IMAGES[cat]

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className="flex flex-col items-center gap-2 group focus:outline-none transition-transform active:scale-95"
            >
              {/* Circular Avatar / Badge */}
              <div
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 overflow-hidden ${
                  isAll
                    ? isSelected
                      ? 'bg-[#E50914] text-white shadow-lg shadow-red-500/30 ring-4 ring-red-100 scale-105'
                      : 'bg-red-500 text-white opacity-85 hover:opacity-100'
                    : isSelected
                    ? 'ring-3 ring-[#E50914] ring-offset-2 shadow-md scale-105 bg-slate-100'
                    : 'ring-1 ring-slate-200 hover:ring-slate-300 bg-slate-100'
                }`}
              >
                {isAll ? (
                  <span className="font-black text-xs tracking-wider uppercase">ALL</span>
                ) : imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={cat}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <span className="font-bold text-[11px] text-slate-700">{cat.slice(0, 3)}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-bold tracking-tight text-center max-w-[70px] truncate transition-colors ${
                  isSelected ? 'text-[#E50914]' : 'text-slate-700 group-hover:text-slate-900'
                }`}
              >
                {cat}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
