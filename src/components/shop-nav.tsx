'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, BarChart3, Settings, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ShopNav() {
  const { shopId } = useParams()
  const pathname = usePathname()

  const links = [
    {
      name: 'Orders',
      href: `/shop/${shopId}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: 'Menu',
      href: `/shop/${shopId}/dashboard/menu`,
      icon: UtensilsCrossed,
    },
    {
      name: 'Offline Sale',
      href: `/shop/${shopId}/dashboard/offline`,
      icon: PlusCircle,
    },
    {
      name: 'Stats',
      href: `/shop/${shopId}/dashboard/stats`,
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: `/shop/${shopId}/dashboard/settings`,
      icon: Settings,
    },
  ]

  return (
    <nav className="flex items-center justify-around bg-white border-t border-slate-100 px-2 py-3 fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto md:flex-col md:w-64 md:h-screen md:justify-start md:gap-4 md:border-t-0 md:border-r md:px-4 md:py-8">
      <div className="hidden md:block mb-8 px-2">
        <h2 className="text-xl font-extrabold text-primary">ShopPanel</h2>
      </div>
      
      {links.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 rounded-xl transition-all w-full",
              isActive 
                ? "text-primary md:bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-slate-50"
            )}
          >
            <Icon size={24} className={isActive ? "text-primary" : "text-muted-foreground"} />
            <span className="text-[10px] md:text-sm font-bold">{link.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
