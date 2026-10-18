'use client'

import { useState, useEffect, useMemo } from 'react'
import { getShops, getAllFoodCourtItems, getAllCategories } from '@/lib/data'
import { Shop, Item } from '@/lib/types'
import { PlazaHeader } from '@/components/plaza-header'
import { BannerCarousel } from '@/components/banner-carousel'
import { CafeFilter } from '@/components/cafe-filter'
import { CategoryRail } from '@/components/category-rail'
import { MenuItem } from '@/components/menu-item'
import { CartDrawer } from '@/components/cart-drawer'
import { OrderModal } from '@/components/order-modal'
import { OrderTrackingModal } from '@/components/order-tracking-modal'
import { UtensilsCrossed, Store, Utensils, Star, Clock, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function CustomerMenuPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<string[]>([])
  
  const [viewMode, setViewMode] = useState<'products' | 'cafes'>('products')
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [loadedShops, loadedItems, loadedCategories] = await Promise.all([
          getShops(),
          getAllFoodCourtItems(),
          getAllCategories()
        ])
        setShops(loadedShops)
        setItems(loadedItems)
        setCategories(loadedCategories)
      } catch (err) {
        console.error('Failed to load menu data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter items based on shop, category, and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Shop filter
      if (selectedShopId && item.shop_id !== selectedShopId) {
        return false
      }
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchName = item.name.toLowerCase().includes(query)
        const matchDesc = item.description?.toLowerCase().includes(query)
        const matchCat = item.category.toLowerCase().includes(query)
        const matchShop = item.shop_name?.toLowerCase().includes(query)
        if (!matchName && !matchDesc && !matchCat && !matchShop) {
          return false
        }
      }
      return true
    })
  }, [items, selectedShopId, selectedCategory, searchQuery])

  // Group filtered items by category for sectioned presentation
  const groupedCategories = useMemo(() => {
    const map = new Map<string, Item[]>()
    filteredItems.forEach((item) => {
      const list = map.get(item.category) || []
      list.push(item)
      map.set(item.category, list)
    })
    return Array.from(map.entries())
  }, [filteredItems])

  const activeShop = shops.find(s => s.id === selectedShopId)

  const handleSelectCafeFromCard = (shopId: string) => {
    setSelectedShopId(shopId)
    setSelectedCategory('ALL')
    setViewMode('products')
    window.scrollTo({ top: 380, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-red-100 selection:text-red-700">
      {/* Sticky PlazaBite Top Bar */}
      <PlazaHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        activeCafeName={activeShop?.name} 
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pb-32">
        {/* Promotional Hero Banner Carousel (hidden when actively searching) */}
        {!searchQuery && <BannerCarousel />}

        {/* View Switcher: Only displayed when multiple cafes share the venue */}
        {shops.length > 1 && (
        <div className="flex items-center justify-center my-3">
          <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setViewMode('products')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === 'products'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Utensils size={14} className={viewMode === 'products' ? 'text-[#E50914]' : ''} />
              <span>Browse by Dishes</span>
            </button>

            <button
              onClick={() => setViewMode('cafes')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === 'cafes'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store size={14} className={viewMode === 'cafes' ? 'text-[#E50914]' : ''} />
              <span>Browse by Cafe ({shops.length})</span>
            </button>
          </div>
        </div>
        )}

        {/* --- VIEW MODE 1: BROWSE BY CAFE / OUTLETS --- */}
        {viewMode === 'cafes' ? (
          <div className="my-4 space-y-4">
            <div className="px-1">
              <h2 className="text-xl font-black text-slate-900">Food Court Outlets</h2>
              <p className="text-xs text-slate-500 font-medium">
                Multiple cafes sharing one seating area. Pick an outlet to explore their specialty menu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => handleSelectCafeFromCard(shop.id)}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                    {shop.banner_url ? (
                      <Image
                        src={shop.banner_url}
                        alt={shop.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Store size={36} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-black text-slate-900 shadow-xs">
                      <Star size={13} className="text-amber-400 fill-current" />
                      <span>{shop.rating || 4.8}</span>
                    </div>

                    {/* Logo & Category */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
                      {shop.logo_url && (
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-white bg-white shadow-md shrink-0">
                          <Image src={shop.logo_url} alt="" fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-black text-white leading-tight drop-shadow-sm">
                          {shop.name}
                        </h3>
                        <p className="text-xs font-semibold text-white/90 drop-shadow-xs">
                          {shop.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between text-xs border-t border-slate-100 bg-white">
                    <span className="text-slate-500 flex items-center gap-1 font-semibold">
                      <Clock size={13} className="text-[#E50914]" /> {shop.estimated_time || '15 mins'} prep
                    </span>
                    <span className="font-black text-[#E50914] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      View Cafe Menu <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- VIEW MODE 2: BROWSE BY PRODUCT (PlazaBite Standard) --- */
          <>
            {/* Multi-Cafe Shared Outlet Filter - only if multi-shop */}
            {shops.length > 1 ? (
              <CafeFilter
                shops={shops}
                selectedShopId={selectedShopId}
                onSelectShop={setSelectedShopId}
              />
            ) : shops.length === 1 ? (
              <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-3 my-2 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center font-black">
                    <Store size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">{shops[0].name}</h3>
                    <p className="text-[11px] font-semibold text-slate-400">{shops[0].category} • {shops[0].estimated_time || '15 mins'} prep</p>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  ★ {shops[0].rating || 4.8}
                </span>
              </div>
            ) : null}

            {/* PlazaBite Circular Category Rail */}
            <CategoryRail
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Active Filter Status Pill */}
            {(selectedShopId || selectedCategory !== 'ALL' || searchQuery) && (
              <div className="flex items-center justify-between my-3 px-1 py-1.5 bg-red-50/70 border border-red-100 rounded-2xl text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 px-2 font-medium">
                  <span>Showing:</span>
                  <span className="font-extrabold text-[#E50914]">
                    {activeShop ? activeShop.name : 'All Cafes'}
                    {selectedCategory !== 'ALL' ? ` • ${selectedCategory}` : ''}
                    {searchQuery ? ` • "${searchQuery}"` : ''}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedShopId(null)
                    setSelectedCategory('ALL')
                    setSearchQuery('')
                  }}
                  className="text-[11px] font-bold text-red-600 hover:underline px-2"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Menu Items List */}
            <div className="mt-4 space-y-7">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-white rounded-3xl p-4 flex gap-4 animate-pulse">
                      <div className="w-22 h-22 rounded-2xl bg-slate-200" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 rounded w-4/5" />
                        <div className="h-5 bg-slate-200 rounded w-16 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : groupedCategories.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-red-50 text-[#E50914] flex items-center justify-center mx-auto mb-3">
                    <UtensilsCrossed size={28} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">No dishes found</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
                    We couldn&apos;t find any items matching your filter in this food plaza. Try searching for something else.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedShopId(null)
                      setSelectedCategory('ALL')
                      setSearchQuery('')
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#E50914] text-white font-bold text-xs uppercase tracking-wider"
                  >
                    View Full Plaza Menu
                  </button>
                </div>
              ) : (
                groupedCategories.map(([categoryName, categoryItems]) => (
                  <section key={categoryName} id={categoryName} className="scroll-mt-36">
                    {/* Category Header */}
                    <div className="flex items-center justify-between gap-3 mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                          {categoryName}
                        </h2>
                        <span className="text-[11px] font-black text-[#E50914] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          {categoryItems.length}
                        </span>
                      </div>
                      <div className="h-px flex-1 bg-slate-200/80 hidden sm:block" />
                    </div>

                    {/* Items Grid (responsive 1-col on mobile, 2-col on tablet/desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {categoryItems.map((item) => (
                        <MenuItem key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* Floating Bottom Cart & PlazaBite "Your Order" Drawer */}
      <CartDrawer />

      {/* PlazaBite Phone Login & OTP Verification Modal */}
      <OrderModal />

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal />
    </div>
  )
}
