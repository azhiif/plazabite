'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-store'
import { placeOrder, sendOrderOTP, verifyOrderOTP, getShop } from '@/lib/data'
import { Shop } from '@/lib/types'
import { 
  Phone, User, MapPin, X, CreditCard, Banknote, ShieldCheck, 
  Loader2, KeyRound, ArrowLeft, CheckCircle2, QrCode, 
  ExternalLink, Copy, Check, Sparkles, Smartphone, Utensils
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export function OrderModal() {
  const {
    items,
    getTotal,
    clearCart,
    tableNumber,
    orderNotes,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setLastOrder
  } = useCart()

  const [step, setStep] = useState<'details' | 'otp' | 'upi'>('details')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Counter'>('UPI')
  const [upiViewMode, setUpiViewMode] = useState<'app' | 'qr'>('app')
  const [utrNumber, setUtrNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedUpi, setCopiedUpi] = useState(false)
  const [diningMode, setDiningMode] = useState<'dine_in' | 'takeaway'>('takeaway')
  const [shop, setShop] = useState<Shop | null>(null)

  if (!isCheckoutOpen) return null

  const totalAmount = getTotal()
  const primaryShopId = items[0]?.shop_id || '11111111-1111-1111-1111-111111111111'

  useEffect(() => {
    if (primaryShopId) {
      getShop(primaryShopId).then(s => {
        if (s) setShop(s)
      })
    }
  }, [primaryShopId])

  // Direct Shop Payment: Use specific shop UPI ID if configured
  const merchantUpiId = shop?.upi_id || 'caffellon@okhdfcbank'
  const merchantName = shop?.name || 'Plaza Cafe'
  const upiOrderNote = diningMode === 'takeaway' ? 'Self-Pickup Order' : ('Table ' + (tableNumber || '4') + ' Order')
  
  // Standard NPCI UPI Intent URI format directly to specific shop
  const upiIntentUrl = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(upiOrderNote)}`
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiIntentUrl)}`

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(merchantUpiId)
    setCopiedUpi(true)
    toast.success('UPI ID copied to clipboard!')
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await sendOrderOTP(cleanPhone)
      setSimulatedOtp(res.simulatedOtp)
      setStep('otp')
      toast.success(`Verification code sent to +91 ${cleanPhone}`, {
        description: `OTP: ${res.simulatedOtp}`,
        icon: '📲',
        duration: 8000
      })
    } catch (err) {
      toast.error('Could not send verification code. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 4) return

    setIsSubmitting(true)
    try {
      const isValid = await verifyOrderOTP(phone, otp)
      if (!isValid) {
        toast.error('Invalid OTP. Please check and re-enter.')
        setIsSubmitting(false)
        return
      }

      // If user chose Pay at Counter, complete order immediately
      if (paymentMethod === 'Counter') {
        await executePlaceOrder('Pending')
      } else {
        // If user chose UPI, proceed to UPI step
        setStep('upi')
        setIsSubmitting(false)
      }
    } catch (err) {
      toast.error('Verification failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Execute Order Placement in Database
  const executePlaceOrder = async (payStatus: 'Pending' | 'Paid', utr?: string) => {
    setIsSubmitting(true)
    try {
      const primaryShopId = items[0]?.shop_id || '11111111-1111-1111-1111-111111111111'
      const shopNames = Array.from(new Set(items.map(i => i.shop_name || 'Cafe'))).join(', ')

      const finalNotes = [
        orderNotes ? orderNotes : null,
        utr ? `[PAID via UPI • UTR: ${utr}]` : payStatus === 'Paid' ? '[PAID via UPI]' : '[Pay at Counter]'
      ].filter(Boolean).join(' • ')

      const createdOrder = await placeOrder({
        table_number: diningMode === 'takeaway' ? 0 : Number(tableNumber || 4),
        shop_id: primaryShopId,
        shop_name: shopNames,
        customer_name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        notes: finalNotes,
        total: totalAmount,
        payment_status: payStatus,
        dining_option: diningMode
      }, items)

      // Save customer info
      localStorage.setItem('customer_phone', phone.replace(/\D/g, ''))
      localStorage.setItem('customer_name', name.trim())

      if (createdOrder) {
        setLastOrder(createdOrder)
      }

      clearCart()
      setIsCheckoutOpen(false)
      setStep('details')
      setUtrNumber('')

      toast.success(payStatus === 'Paid' ? 'Payment Confirmed! Order sent to kitchen.' : 'Order Placed! Please pay at the counter.', {
        icon: '🎉',
        duration: 5000
      })
    } catch (err) {
      console.error('Order creation error:', err)
      toast.error('Failed to create order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar relative animate-in slide-in-from-bottom duration-300"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsCheckoutOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {step === 'details' ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center mb-3 shadow-xs">
              <Phone size={22} strokeWidth={2.2} />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">Dine-in Order Checkout</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
              Enter your details to confirm seating & receive live order updates.
            </p>

            <form onSubmit={handleSendOTP} className="space-y-3.5">
              {/* Phone Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Mobile Number *
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#E50914] focus-within:ring-2 focus-within:ring-red-100 transition-all">
                  <span className="text-xs font-black text-slate-500 mr-2 border-r border-slate-200 pr-2">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="w-full text-sm font-semibold bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Your Name *
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#E50914] focus-within:ring-2 focus-within:ring-red-100 transition-all">
                  <User size={16} className="text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Ashif"
                    className="w-full text-sm font-semibold bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* Order Mode: Token vs Table */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Dining Option (Shared Food Court)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiningMode('takeaway')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                      diningMode === 'takeaway'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-black flex items-center gap-1.5">
                      <Utensils size={14} className="text-purple-600" />
                      <span>Counter Pickup (Token)</span>
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight">No table needed • Self-pickup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDiningMode('dine_in')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                      diningMode === 'dine_in'
                        ? 'border-[#E50914] bg-red-50 text-[#E50914] font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-black flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#E50914]" />
                      <span>Dine-In Table #{tableNumber || '4'}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight">Plaza runner brings to table</span>
                  </button>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Payment Option
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-[#E50914] bg-red-50/70 text-[#E50914] font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 font-medium hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <Smartphone size={15} className="text-[#E50914]" />
                      <span>Instant UPI Pay</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal leading-tight">
                      GPay, PhonePe, Paytm, QR
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Counter')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      paymentMethod === 'Counter'
                        ? 'border-[#E50914] bg-red-50/70 text-[#E50914] font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 font-medium hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <Banknote size={15} />
                      <span>Pay at Counter</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal leading-tight">
                      Cash or Card at desk
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-13 rounded-2xl bg-[#E50914] hover:bg-red-700 disabled:bg-slate-300 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Continue to Order (₹{totalAmount})</span>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : step === 'otp' ? (
          <>
            {/* OTP Verification Step */}
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center mb-3 shadow-xs">
              <KeyRound size={22} strokeWidth={2.2} />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">Verify Your Mobile</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
              Enter the 4-digit code sent to <span className="font-extrabold text-slate-900">+91 {phone}</span>
            </p>

            {/* Quick Test Helper Banner */}
            {simulatedOtp && (
              <div 
                onClick={() => setOtp(simulatedOtp)}
                className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium cursor-pointer hover:bg-amber-100 transition-colors flex items-center justify-between"
              >
                <span>Code: <strong className="font-black tracking-widest text-[#E50914] text-sm ml-1">{simulatedOtp}</strong></span>
                <span className="text-[10px] font-bold bg-amber-200/80 px-2 py-0.5 rounded-full">Tap to autofill</span>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-48 h-14 mx-auto text-center font-black text-2xl tracking-[0.5em] bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-[#E50914] focus:ring-4 focus:ring-red-100 outline-none transition-all block"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.length < 4}
                className="w-full h-13 rounded-2xl bg-[#E50914] hover:bg-red-700 disabled:bg-slate-300 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>{paymentMethod === 'UPI' ? 'Verify & Proceed to UPI' : 'Confirm Order for Table #' + (tableNumber || '4')}</span>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sendOrderOTP(phone)
                    toast.success('New OTP sent!')
                  }}
                  className="text-[#E50914] hover:underline font-bold"
                >
                  Resend Code
                </button>
              </div>
            </form>
          </>
        ) : (
          /* ========================================================================= */
          /* STEP 3: DIRECT UPI PAYMENT SCREEN                                         */
          /* ========================================================================= */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center font-black">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Direct UPI Payment</h3>
                  <span className="text-[11px] text-emerald-700 font-semibold">Direct Pay to {merchantName} • 0% Fees</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-bold block leading-none">Amount Due</span>
                <span className="text-xl font-black text-[#E50914]">₹{totalAmount}</span>
              </div>
            </div>

            {/* View Switcher: Open App vs Scan QR */}
            <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setUpiViewMode('app')}
                className={`flex-1 py-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                  upiViewMode === 'app' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                <ExternalLink size={13} />
                <span>Pay on this Phone</span>
              </button>
              <button
                type="button"
                onClick={() => setUpiViewMode('qr')}
                className={`flex-1 py-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                  upiViewMode === 'qr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                <QrCode size={13} />
                <span>Scan QR Code</span>
              </button>
            </div>

            {upiViewMode === 'app' ? (
              <div className="space-y-3">
                {/* 1-Tap UPI Launch Button */}
                <a
                  href={upiIntentUrl}
                  className="w-full h-13 rounded-2xl bg-[#E50914] hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <ExternalLink size={16} />
                  <span>Launch UPI App (₹{totalAmount})</span>
                </a>

                {/* Quick App Icons List */}
                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                  <a href={upiIntentUrl} className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex flex-col items-center gap-1">
                    <span className="text-xs font-black text-[#4285F4]">GPay</span>
                    <span className="text-[9px] text-slate-400">Google</span>
                  </a>
                  <a href={upiIntentUrl} className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex flex-col items-center gap-1">
                    <span className="text-xs font-black text-[#5f259f]">PhonePe</span>
                    <span className="text-[9px] text-slate-400">UPI</span>
                  </a>
                  <a href={upiIntentUrl} className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex flex-col items-center gap-1">
                    <span className="text-xs font-black text-[#00b9f5]">Paytm</span>
                    <span className="text-[9px] text-slate-400">UPI</span>
                  </a>
                  <a href={upiIntentUrl} className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex flex-col items-center gap-1">
                    <span className="text-xs font-black text-emerald-600">BHIM</span>
                    <span className="text-[9px] text-slate-400">NPCI</span>
                  </a>
                </div>
              </div>
            ) : (
              /* Dynamic QR Code Mode */
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md mb-2">
                  <img
                    src={dynamicQrUrl}
                    alt="UPI Payment QR Code"
                    width={180}
                    height={180}
                    className="rounded-lg"
                  />
                </div>
                <span className="text-xs font-extrabold text-slate-700">
                  Scan with any camera or UPI app to pay ₹{totalAmount}
                </span>
              </div>
            )}

            {/* UPI ID copy pill */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 truncate">
                <span className="font-bold text-slate-400 text-[10px] uppercase">UPI ID:</span>
                <span className="font-mono font-bold text-slate-800 text-[11px] truncate">{merchantUpiId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpiId}
                className="text-xs font-bold text-[#E50914] flex items-center gap-1 hover:underline ml-2 shrink-0"
              >
                {copiedUpi ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Step 3 Confirmation & Optional UTR Input */}
            <div className="pt-2 space-y-2.5 border-t border-slate-100">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  12-Digit UPI Ref / UTR (Optional / Quick confirm)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                  placeholder="e.g. 428912345678"
                  className="w-full h-11 px-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-mono placeholder:text-slate-400 focus:border-[#E50914] focus:ring-2 focus:ring-red-100 outline-none transition-all"
                />
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => executePlaceOrder('Paid', utrNumber)}
                className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>I Have Paid — Send to Kitchen</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => executePlaceOrder('Pending')}
                  className="text-slate-400 hover:text-slate-600 underline font-medium text-[11px]"
                >
                  Switch to Pay at Counter
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-4">
          <ShieldCheck size={12} className="text-green-600" />
          <span>NPCI Direct UPI • 0% Surcharge • Instant Kitchen Dispatch</span>
        </div>
      </div>
    </div>
  )
}
