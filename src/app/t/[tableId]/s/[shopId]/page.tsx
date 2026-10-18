import { getShop, getItemsByShop } from '@/lib/data'
import { MenuItem } from '@/components/menu-item'
import { CartDrawer } from '@/components/cart-drawer'
import { ArrowLeft, Search, Info } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export default async function ShopMenuPage({ 
  params 
}: { 
  params: { tableId: string, shopId: string } 
}) {
  const { tableId, shopId } = await params
  const [shop, items] = await Promise.all([
    getShop(shopId),
    getItemsByShop(shopId)
  ])

  if (!shop) return notFound()

  // Group items by category
  const categories = Array.from(new Set(items.map(i => i.category)))

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/t/${tableId}`} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-tight">{shop.name}</h1>
            <p className="text-xs text-muted-foreground">{shop.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Search size={20} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Info size={20} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="bg-white border-b border-slate-100 sticky top-[61px] z-40">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex p-2 gap-2">
            {categories.map((category) => (
              <Link 
                key={category} 
                href={`#${category}`}
                className="px-4 py-2 rounded-full text-sm font-bold bg-slate-50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent"
              >
                {category}
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-8">
        {categories.map((category) => (
          <section key={category} id={category} className="scroll-mt-32">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-extrabold text-foreground">{category}</h2>
              <div className="h-[2px] flex-1 bg-slate-100 mt-1" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {items.filter(i => i.category === category).length} items
              </span>
            </div>
            <div className="grid gap-4">
              {items
                .filter((item) => item.category === category)
                .map((item) => (
                  <MenuItem key={item.id} item={item} />
                ))}
            </div>
          </section>
        ))}
      </div>

      <CartDrawer />
    </main>
  )
}
