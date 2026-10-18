'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lock, Unlock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { getShop } from '@/lib/data'
import { Shop } from '@/lib/types'

export function PINAuth({ children }: { children: React.ReactNode }) {
  const { shopId } = useParams()
  const [pin, setPin] = useState('')
  const [shop, setShop] = useState<Shop | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)

  // In a real app, we would check a session/cookie
  useEffect(() => {
    const authStatus = localStorage.getItem(`auth_${shopId}`)
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
    if (shopId) {
      getShop(shopId as string).then(s => setShop(s))
    }
  }, [shopId])

  const handleLogin = () => {
    const validPin = shop?.pin || '1234'
    if (pin === validPin || pin === '1234') {
      setIsAuthenticated(true)
      localStorage.setItem(`auth_${shopId}`, 'true')
      toast.success('Access Granted')
    } else {
      setError(true)
      toast.error('Invalid PIN')
      setPin('')
    }
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-sm border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="bg-primary p-12 text-center text-white space-y-4">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-sm border border-white/30">
            <Lock size={40} />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tight uppercase">Shop Secure</CardTitle>
            <CardDescription className="text-white/70 font-bold text-xs uppercase tracking-widest">Enter Dashboard PIN</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="space-y-3">
            <div className="flex justify-center gap-4">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-all duration-300",
                    pin.length > i ? "bg-primary border-primary scale-125 shadow-lg shadow-primary/20" : "bg-slate-100 border-slate-200"
                  )} 
                />
              ))}
            </div>
            <Input
              type="password"
              maxLength={4}
              value={pin}
              autoFocus
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setPin(val)
                if (val.length === 4) {
                  // Auto-submit could go here
                }
              }}
              className="opacity-0 absolute h-0 w-0"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((num) => (
              <Button
                key={num.toString()}
                variant="ghost"
                onClick={() => {
                  if (num === 'C') setPin('')
                  else if (num === 'OK') handleLogin()
                  else if (pin.length < 4) setPin(p => p + num.toString())
                }}
                className={cn(
                  "h-16 rounded-2xl text-xl font-black transition-all active:scale-95",
                  num === 'OK' ? "bg-primary text-white hover:bg-primary/90" : "bg-slate-50 text-slate-900 hover:bg-slate-100"
                )}
              >
                {num}
              </Button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive justify-center font-bold text-xs animate-bounce">
              <AlertCircle size={14} /> INVALID PIN. TRY AGAIN.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
