'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getShop, updateShopProfile } from '@/lib/data'
import { Shop } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Store, Clock, Image as ImageIcon, Key, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function ShopSettingsPage() {
  const { shopId } = useParams()
  const [shop, setShop] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    estimated_time: '',
    description: '',
    logo_url: '',
    banner_url: '',
    pin: '',
    is_open: true
  })

  useEffect(() => {
    async function loadShop() {
      try {
        setIsLoading(true)
        const data = await getShop(shopId as string)
        if (data) {
          setShop(data)
          setFormData({
            name: data.name || '',
            category: data.category || '',
            estimated_time: data.estimated_time || '15 mins',
            description: data.description || '',
            logo_url: data.logo_url || '',
            banner_url: data.banner_url || '',
            pin: data.pin || '1234',
            is_open: data.is_open ?? true
          })
        }
      } catch (err) {
        toast.error('Failed to load cafe details')
      } finally {
        setIsLoading(false)
      }
    }
    loadShop()
  }, [shopId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const updated = await updateShopProfile(shopId as string, {
        name: formData.name.trim(),
        category: formData.category.trim(),
        estimated_time: formData.estimated_time.trim(),
        description: formData.description.trim(),
        logo_url: formData.logo_url.trim() || undefined,
        banner_url: formData.banner_url.trim() || undefined,
        pin: formData.pin.trim() || '1234',
        is_open: formData.is_open
      })

      if (updated) setShop(updated)
      toast.success('Cafe details updated successfully!', { icon: '✨' })
    } catch (err) {
      toast.error('Failed to update cafe profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <header className="pb-4 border-b border-slate-100">
        <span className="text-xs font-black uppercase tracking-wider text-[#E50914] bg-red-50 px-2 py-0.5 rounded-md border border-red-100 inline-block mb-1">
          Store Settings
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Cafe Profile & Operations
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Edit your outlet information, preparation timings, banner visuals, and security PIN.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Open / Closed Toggle Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${formData.is_open ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
              <Store size={20} />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">
                {formData.is_open ? 'Kitchen is Open for Orders' : 'Kitchen is Temporarily Closed'}
              </h3>
              <p className="text-xs text-slate-500">
                {formData.is_open
                  ? 'Customers at the food court tables can place orders directly.'
                  : 'Your dishes will appear paused on the customer menu.'}
              </p>
            </div>
          </div>
          <Switch
            checked={formData.is_open}
            onCheckedChange={(checked) => setFormData({ ...formData, is_open: checked })}
            className="data-[state=checked]:bg-green-600"
          />
        </div>

        {/* Basic Details */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Store Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Cafe Name
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-2xl h-11 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Cuisine / Category
              </label>
              <Input
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Rolls, Burgers & Fries"
                className="rounded-2xl h-11 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Avg. Preparation Time
              </label>
              <Input
                value={formData.estimated_time}
                onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                placeholder="e.g. 15-20 mins"
                className="rounded-2xl h-11 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Dashboard Access PIN
              </label>
              <Input
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                placeholder="1234"
                maxLength={8}
                className="rounded-2xl h-11 text-sm font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Short Description / Bio
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Freshly prepared rolls, smash burgers & cold drinks..."
              className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium outline-none focus:border-[#E50914] focus:ring-1 focus:ring-red-100"
            />
          </div>
        </div>

        {/* Visuals: Logo & Banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Visual Branding</h3>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Banner Cover Image URL
              </label>
              <Input
                value={formData.banner_url}
                onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="rounded-2xl h-11 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Logo / Avatar Image URL
              </label>
              <Input
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="rounded-2xl h-11 text-xs font-medium"
              />
            </div>

            {/* Preview Banner */}
            {formData.banner_url && (
              <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mt-2">
                <Image src={formData.banner_url} alt="Cover preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-end p-4 text-white text-xs font-bold">
                  Banner Live Preview
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Action */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full h-13 rounded-2xl bg-[#E50914] hover:bg-red-700 disabled:bg-slate-300 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          <span>Save Cafe Settings</span>
        </button>
      </form>
    </div>
  )
}
