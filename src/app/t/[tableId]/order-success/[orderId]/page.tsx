'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Home, Receipt, ArrowRight, Table } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

export default function OrderSuccessPage() {
  const { tableId, orderId } = useParams()
  const customerName = typeof window !== 'undefined' ? localStorage.getItem('customerName') : ''

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-16 gap-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center space-y-4"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Placed!</h1>
          <p className="text-muted-foreground font-medium">Your delicious food is on the way.</p>
        </div>
      </motion.div>

      <Card className="w-full max-w-md border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Order ID</span>
              <p className="font-extrabold text-sm text-gray-900">#{orderId}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Table</span>
              <p className="font-extrabold text-sm text-primary flex items-center justify-end gap-1">
                <Table size={14} /> {tableId}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Receipt size={20} className="text-muted-foreground" />
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Customer</p>
                <p className="font-bold text-gray-900 leading-none">{customerName || 'Valued Customer'}</p>
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 border-dashed">
              <p className="text-sm text-orange-800 font-medium text-center">
                Check the shop dashboard or wait for your food at Table {tableId}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="w-full max-w-md space-y-3">
        <Link href={`/t/${tableId}`}>
          <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-bold text-base gap-2 hover:bg-slate-50 transition-all">
            <Home size={20} /> Order More
          </Button>
        </Link>
        <Button variant="ghost" className="w-full h-12 rounded-2xl text-muted-foreground font-semibold hover:text-primary transition-colors">
          Track Order Status
        </Button>
      </div>
      
      <p className="text-[10px] text-muted-foreground text-center max-w-[200px] mt-auto">
        Thank you for choosing Shared Seating Food Court. Enjoy your meal!
      </p>
    </main>
  )
}
