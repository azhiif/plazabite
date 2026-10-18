import { ShopNav } from '@/components/shop-nav'
import { PINAuth } from '@/components/pin-auth'

export default function ShopDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <PINAuth>
        <ShopNav />
        <main className="flex-1 pb-24 md:pb-0 md:pl-64">
          {children}
        </main>
      </PINAuth>
    </div>
  )
}
