'use client'

import Image from 'next/image'
import Link from 'next/link'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  withText?: boolean
  subtitle?: string
  clickable?: boolean
  className?: string
  variant?: 'light' | 'dark' | 'auto'
}

export function BrandLogo({
  size = 'md',
  withText = true,
  subtitle,
  clickable = true,
  className = '',
  variant = 'auto'
}: BrandLogoProps) {
  const iconDimensions = {
    sm: { w: 28, h: 28, text: 'text-lg', sub: 'text-[9px]' },
    md: { w: 38, h: 38, text: 'text-2xl', sub: 'text-[10px]' },
    lg: { w: 48, h: 48, text: 'text-3xl', sub: 'text-xs' },
    xl: { w: 64, h: 64, text: 'text-4xl', sub: 'text-sm' },
  }[size]

  // Detect dark background from variant or className
  const isDark = variant === 'dark' || (variant === 'auto' && className.includes('text-white'))

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Image */}
      <div 
        className="relative overflow-hidden rounded-2xl shadow-xs border border-white/10 flex items-center justify-center shrink-0"
        style={{ width: iconDimensions.w, height: iconDimensions.h }}
      >
        <Image
          src="/images/logo.png"
          alt="PlazaBite Logo"
          width={iconDimensions.w}
          height={iconDimensions.h}
          className="object-cover w-full h-full rounded-2xl"
          priority
        />
      </div>

      {withText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'} ${iconDimensions.text}`}>
            Plaza<span className="text-[#E50914]">Bite</span>
          </span>
          {subtitle && (
            <span className={`font-bold uppercase tracking-widest mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-400'} ${iconDimensions.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (clickable) {
    return (
      <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
