'use client'

import { useCart } from '@/lib/cart-store'
import { MenuItem } from '@/components/menu-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Trash2, ShoppingBag, User, Phone, CreditCard, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getTableByNumber, placeOrder } from '@/lib/data'

export default function CartPage() {
  const { items, updateQuantity, getTotal, clearCart } = useCart()
  const { tableId } = useParams()
  const router = useRouter()
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentOption, setPaymentOption] = useState<'Pay Now' | 'Pay Later'>('Pay Later')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('customerName')
    const savedPhone = localStorage.getItem('phone')
    if (savedName) setCustomerName(savedName)
    if (savedPhone) setPhone(savedPhone)
  }, [])

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 gap-6">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
          <ShoppingBag size={48} className="text-muted-foreground/20" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2">Add some delicious food to get started!</p>
        </div>
        <Link href={`/t/${tableId}`}>
          <Button className="rounded-full px-8 h-12">Browse Shops</Button>
        </Link>
      </main>
    )
  }

  const handlePlaceOrder = async () => {
    if (!customerName || !phone) {
      toast.error('Please enter your name and phone number')
      return
    }

    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Save to localStorage
      localStorage.setItem('customerName', customerName)
      localStorage.setItem('phone', phone)

      // 1. Get the real table UUID from the table number
      const tableData = await getTableByNumber(Number(tableId))
      
      if (!tableData) {
        toast.error('Invalid table. Please scan the QR code again.')
        setIsSubmitting(false)
        return
      }

      // 2. We assume all items in the cart are from the same shop for this simplified checkout
      const shopId = items[0].shop_id

      // 3. Place the order
      const order = await placeOrder({
        table_id: tableData.id,
        shop_id: shopId,
        customer_name: customerName,
        phone: phone,
        total: getTotal(),
        payment_status: paymentOption === 'Pay Now' ? 'Paid' : 'Pending',
      }, items)

      setIsSubmitting(false)
      clearCart()
      if (order?.id) {
        router.push(`/t/${tableId}/order-success/${order.id}`)
      } else {
        toast.success('Order placed successfully!')
        router.push(`/t/${tableId}`)
      }
    } catch (error: any) {
      console.error('Order placement failed:', error)
      toast.error(error.message || 'Failed to place order. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-40">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <Link href={`/t/${tableId}`} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-lg">Your Cart</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Cart Items */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Items Summary</h2>
            <button onClick={clearCart} className="text-xs text-destructive font-bold">Clear All</button>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-primary font-bold text-sm">₹{item.price * item.quantity}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-full p-1 border border-slate-200">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-primary shadow-sm"
                  >
                    <Trash2 size={14} className={item.quantity === 1 ? 'text-destructive' : ''} />
                  </button>
                  <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center bg-primary rounded-full text-white shadow-sm"
                  >
                    <ShoppingBag size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Customer Details */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Customer Details</h2>
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 ml-1">
                  <User size={12} /> NAME
                </label>
                <Input
                  className="rounded-2xl h-12 bg-slate-50 border-none px-4 font-medium"
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 ml-1">
                  <Phone size={12} /> PHONE NUMBER
                </label>
                <Input
                  className="rounded-2xl h-12 bg-slate-50 border-none px-4 font-medium"
                  placeholder="10-digit phone number"
                  maxLength={10}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Payment Options */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentOption('Pay Now')}
              className={`p-4 rounded-3xl border-2 transition-all text-left flex flex-col gap-2 ${
                paymentOption === 'Pay Now'
                  ? 'border-primary bg-primary/5 shadow-inner'
                  : 'border-white bg-white shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-xl w-fit ${paymentOption === 'Pay Now' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                <CreditCard size={20} />
              </div>
              <div>
                <span className="font-bold text-sm block">Pay Now</span>
                <span className="text-[10px] text-muted-foreground">UPI / Card</span>
              </div>
            </button>
            <button
              onClick={() => setPaymentOption('Pay Later')}
              className={`p-4 rounded-3xl border-2 transition-all text-left flex flex-col gap-2 ${
                paymentOption === 'Pay Later'
                  ? 'border-primary bg-primary/5 shadow-inner'
                  : 'border-white bg-white shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-xl w-fit ${paymentOption === 'Pay Later' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Wallet size={20} />
              </div>
              <div>
                <span className="font-bold text-sm block">Pay Later</span>
                <span className="text-[10px] text-muted-foreground">At the counter</span>
              </div>
            </button>
          </div>
        </section>

        {/* Bill Summary */}
        <section className="bg-white p-6 rounded-3xl shadow-sm space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Item Total</span>
            <span className="font-bold">₹{getTotal()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery / Service Fee</span>
            <span className="text-green-600 font-bold uppercase text-[10px]">Free</span>
          </div>
          <Separator className="bg-slate-50" />
          <div className="flex justify-between items-center pt-2">
            <span className="font-extrabold text-lg">Grand Total</span>
            <span className="font-extrabold text-2xl text-primary">₹{getTotal()}</span>
          </div>
        </section>
      </div>

      {/* Place Order Button Sticky */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <Button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl bg-primary text-white shadow-lg text-lg font-bold hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </Button>
        </div>
      </div>
    </main>
  )
}
