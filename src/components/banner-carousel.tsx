'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Banner } from '@/lib/types'
import { getBanners } from '@/lib/data'

interface BannerCarouselProps {
  banners?: Banner[]
  foodCourtId?: string
}

export function BannerCarousel({ banners: initialBanners, foodCourtId }: BannerCarouselProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners || [])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) {
      setBanners(initialBanners)
      return
    }
    async function load() {
      try {
        const loaded = await getBanners(foodCourtId)
        if (loaded && loaded.length > 0) {
          setBanners(loaded)
        }
      } catch (e) {
        console.error('Failed to load banners:', e)
      }
    }
    load()
  }, [initialBanners, foodCourtId])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [banners.length])

  if (!banners || banners.length === 0) {
    return null
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-sm my-3 aspect-[21/9] sm:aspect-[24/8] max-h-56 bg-slate-900">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={banner.image_url}
            alt={banner.title}
            fill
            priority={index === 0}
            className="object-cover object-center scale-105 transition-transform duration-7000 ease-out"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${banner.accent || 'from-black/80 via-black/40 to-transparent'} flex flex-col justify-end p-5 sm:p-7`}>
            {banner.badge && (
              <span className="inline-block text-[10px] sm:text-xs font-black tracking-wider uppercase bg-[#E50914] text-white px-2.5 py-0.5 rounded-full w-fit mb-1 shadow-sm">
                {banner.badge}
              </span>
            )}
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="text-xs sm:text-sm font-semibold text-white/90 drop-shadow-xs">
                {banner.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Pill Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full h-1.5 ${
                idx === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
