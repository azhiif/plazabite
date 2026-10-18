'use client'

import { getItemsByShop } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Minus, CreditCard, Wallet, Banknote, ShoppingCart, CheckCircle2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Item, CartItem } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function OfflineSalesPage() {
  const { shopId } = useParams()
  const [shopItems, setShopItems] = useState<Item[]>([])
  
  useEffect(() => {
    if (shopId) {
      getItemsByShop(shopId as string).then(items => setShopItems(items))
    }
  }, [shopId])
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [quickAmount, setQuickAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addToCart = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(0, i.quantity + delta)
        return { ...i, quantity: newQty }
      }
      return i
    }).filter(i => i.quantity > 0))
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleQuickSale = () => {
    if (!quickAmount || isNaN(Number(quickAmount))) {
      toast.error('Please enter a valid amount')
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      toast.success(`Quick sale of ₹${quickAmount} recorded!`)
      setQuickAmount('')
      setIsSubmitting(false)
    }, 1000)
  }

  const handleDetailedSale = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      toast.success(`Detailed sale of ₹${total} recorded!`)
      setCart([])
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Add Offline Sale</h1>
        <p className="text-muted-foreground font-medium">Log sales made directly at the counter.</p>
      </header>

      <Tabs defaultValue="quick" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex w-fit h-auto">
          <TabsTrigger value="quick" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            Quick Entry
          </TabsTrigger>
          <TabsTrigger value="detailed" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            Detailed Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="mt-0">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white max-w-lg">
            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-50">
              <CardTitle className="text-xl font-bold">Quick Sale</CardTitle>
              <CardDescription>Directly enter the total amount for the sale.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Total Amount (₹)</label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={24} />
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="h-16 pl-14 text-2xl font-black rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20"
                  />
                </div>
              </div>
              <Button 
                onClick={handleQuickSale} 
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl bg-primary text-white text-lg font-bold shadow-lg hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? 'Recording...' : 'Record Sale'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="mt-0 grid md:grid-cols-2 gap-8 items-start">
          {/* Item Selector */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Select Items</h2>
            <div className="grid gap-3">
              {shopItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-50 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                >
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs font-bold text-primary italic">₹{item.price}</p>
                  </div>
                  <Plus size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Sale Summary */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white sticky top-8">
            <CardHeader className="p-6 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Sale Summary</CardTitle>
                <ShoppingCart size={20} className="text-primary" />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4 min-h-[100px]">
                {cart.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8 italic">No items added to cart</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-4 animate-in fade-in slide-in-from-right-2">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground">₹{item.price} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 rounded-full p-1 border border-slate-100">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-white rounded-full text-slate-400 hover:text-destructive transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="w-5 text-center text-xs font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-white rounded-full text-slate-400 hover:text-primary transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <Separator className="bg-slate-50" />
              
              <div className="flex justify-between items-center py-2">
                <span className="font-bold text-slate-400 uppercase text-xs tracking-widest">Grand Total</span>
                <span className="font-black text-3xl text-primary">₹{total}</span>
              </div>

              <Button 
                onClick={handleDetailedSale}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full h-14 rounded-2xl bg-primary text-white font-bold shadow-lg hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? 'Processing...' : 'Complete Sale'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
