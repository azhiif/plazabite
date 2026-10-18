'use client'

import { useState, useEffect } from 'react'
import { getFoodCourts, requestJoinFoodCourt } from '@/lib/data'
import { FoodCourt } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Store, Check, Loader2, Sparkles, Phone, Tag, Key } from 'lucide-react'
import { toast } from 'sonner'

interface RegisterCafeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RegisterCafeModal({ isOpen, onClose }: RegisterCafeModalProps) {
  const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([])
  const [selectedCourtId, setSelectedCourtId] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadCourts() {
      const courts = await getFoodCourts()
      setFoodCourts(courts)
      if (courts.length > 0) setSelectedCourtId(courts[0].id)
    }
    if (isOpen) {
      loadCourts()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !category.trim() || !phone.trim()) {
      toast.error('Please enter your cafe name, category and phone number')
      return
    }

    setIsSubmitting(true)

    try {
      await requestJoinFoodCourt({
        food_court_id: selectedCourtId || foodCourts[0]?.id || 'court-central-01',
        name: name.trim(),
        category: category.trim(),
        phone: phone.replace(/\D/g, ''),
        pin: pin.trim() || '1234',
        description: description.trim()
      })

      toast.success('Registration submitted! The food court owner will review and accept your cafe.', {
        icon: '🎉',
        duration: 8000
      })

      // Reset
      setName('')
      setCategory('')
      setPhone('')
      setPin('')
      setDescription('')
      onClose()
    } catch (err) {
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Store size={24} />
          </div>
          <DialogTitle className="text-center text-xl font-black">
            Join the Food Court
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-500">
            Apply to sell your food at shared dining tables. Once accepted, your menu will go live.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 my-2">
          {/* Food Court Selection */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Select Food Court
            </label>
            <select
              value={selectedCourtId}
              onChange={(e) => setSelectedCourtId(e.target.value)}
              className="w-full h-11 px-3 text-xs font-bold bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:border-[#E50914]"
            >
              {foodCourts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.location ? `(${c.location})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Cafe Name */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Cafe / Outlet Name
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Burger Bay or Chai Point"
              className="rounded-2xl h-11 text-sm font-semibold"
            />
          </div>

          {/* Cuisine Category & Mobile */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Cuisine / Specialty
              </label>
              <Input
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Burgers, Chai, Momos"
                className="rounded-2xl h-11 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Owner Mobile
              </label>
              <Input
                type="tel"
                maxLength={10}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit number"
                className="rounded-2xl h-11 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Desired PIN code */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Choose 4-Digit Login PIN
            </label>
            <Input
              type="text"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 1234 (used to access your kitchen app)"
              className="rounded-2xl h-11 text-xs font-mono font-bold"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Brief Food Menu Bio
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Tell customers and the food court owner what you serve..."
              className="w-full p-2.5 rounded-2xl border border-slate-200 text-xs font-medium outline-none focus:border-[#E50914]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl bg-[#E50914] hover:bg-red-700 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              <span>Submit Partner Application</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
