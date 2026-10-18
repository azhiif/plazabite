'use client'

import { getAllItemsByShop, toggleItemAvailability as toggleInDb, createItem, updateItem, deleteItem, getShop } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Utensils, Search, Filter, Loader2, AlertCircle, Check, X, Sparkles, Image as ImageIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Item, Shop } from '@/lib/types'
import { Switch } from '@/components/ui/switch'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function ShopMenuManagementPage() {
  const { shopId } = useParams()
  const [shop, setShop] = useState<Shop | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image_url: '',
    is_veg: false,
    tag: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const [shopData, data] = await Promise.all([
        getShop(shopId as string),
        getAllItemsByShop(shopId as string)
      ])
      setShop(shopData)
      setItems(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch items:', err)
      setError('Failed to load menu items.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [shopId])

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      category: 'Rolls',
      price: '',
      description: '',
      image_url: '',
      is_veg: false,
      tag: ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (item: Item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      price: String(item.price),
      description: item.description || '',
      image_url: item.image_url || '',
      is_veg: !!item.is_veg,
      tag: item.tag || ''
    })
    setIsModalOpen(true)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.price || !formData.category.trim()) {
      toast.error('Please fill in dish name, price and category')
      return
    }

    setIsSubmitting(true)

    try {
      if (editingItem) {
        // Update existing item
        await updateItem(editingItem.id, {
          name: formData.name.trim(),
          category: formData.category.trim(),
          price: Number(formData.price),
          description: formData.description.trim(),
          image_url: formData.image_url.trim() || undefined,
          is_veg: formData.is_veg,
          tag: formData.tag.trim() || undefined
        })
        toast.success(`${formData.name} updated!`)
      } else {
        // Create new item
        await createItem({
          shop_id: shopId as string,
          shop_name: shop?.name || 'Cafe',
          name: formData.name.trim(),
          category: formData.category.trim(),
          price: Number(formData.price),
          description: formData.description.trim(),
          image_url: formData.image_url.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          is_available: true,
          is_veg: formData.is_veg,
          rating: 4.8,
          tag: formData.tag.trim() || undefined
        })
        toast.success(`${formData.name} added to menu!`)
      }

      setIsModalOpen(false)
      fetchItems()
    } catch (err) {
      toast.error('Failed to save dish')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteItem = async (itemId: string, name: string) => {
    if (!confirm(`Delete ${name} from your menu?`)) return
    try {
      await deleteItem(itemId)
      setItems(prev => prev.filter(i => i.id !== itemId))
      toast.success(`${name} removed`)
    } catch (err) {
      toast.error('Failed to delete item')
    }
  }

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_available: !currentStatus } : i))
      await toggleInDb(itemId, !currentStatus)
      toast.success(`Dish marked as ${!currentStatus ? 'In Stock' : 'Out of Stock'}`)
    } catch (err) {
      console.error('Failed to toggle availability:', err)
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_available: currentStatus } : i))
      toast.error('Failed to toggle availability')
    }
  }

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#E50914] bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
              {shop?.name || 'Cafe Menu'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Food Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Menu Items & Pricing
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Add new dishes, update prices, and toggle in-stock availability instantly.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="h-12 px-6 rounded-2xl bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add New Dish</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input 
          className="pl-11 h-12 rounded-2xl bg-white border-slate-200 text-sm font-medium shadow-2xs" 
          placeholder="Search your items or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Dishes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 bg-white rounded-3xl border border-slate-100 animate-pulse p-4" />
          ))
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
            <Utensils size={44} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No dishes found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Click below to add your first dish to the food court menu.</p>
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 rounded-full bg-[#E50914] text-white font-bold text-xs uppercase"
            >
              Add New Dish
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="border border-slate-100 shadow-xs rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all flex flex-col justify-between">
              <CardContent className="p-0">
                {/* Photo & Availability badge */}
                <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Utensils size={36} />
                    </div>
                  )}

                  {/* Veg / Non Veg badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs">
                    <div className={`w-2.5 h-2.5 rounded-full border ${item.is_veg ? 'bg-green-600 border-green-700' : 'bg-red-600 border-red-700'}`} />
                  </div>

                  {/* Tag */}
                  {item.tag && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase bg-[#E50914] text-white px-2 py-0.5 rounded-md shadow-xs">
                      {item.tag}
                    </span>
                  )}

                  {/* Availability toggle overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-white text-xs font-bold">
                    <span className="text-[10px]">{item.is_available ? 'In Stock' : 'Sold Out'}</span>
                    <Switch
                      checked={item.is_available}
                      onCheckedChange={() => toggleAvailability(item.id, item.is_available)}
                      className="scale-75 data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-slate-900 text-base leading-tight">{item.name}</h3>
                      <span className="text-[10px] font-black uppercase text-[#E50914] bg-red-50 px-2 py-0.5 rounded-md inline-block mt-1">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-lg font-black text-slate-900">₹{item.price}</span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </CardContent>

              {/* Action Buttons: Edit & Delete */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors"
                >
                  <Edit2 size={13} />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={() => handleDeleteItem(item.id, item.name)}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 p-1.5 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add / Edit Dish Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {editingItem ? 'Edit Dish Details' : 'Add New Dish to Menu'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update dish title, price, category, photo and vegetarian status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveItem} className="space-y-3.5 my-2">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Dish Name
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Crispy Chicken Roll"
                className="rounded-2xl h-11 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <Input
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Rolls, Burgers"
                  className="rounded-2xl h-11 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Price (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="149"
                  className="rounded-2xl h-11 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Image URL (Optional)
              </label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="rounded-2xl h-11 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Short tasty description of this dish..."
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium outline-none focus:border-[#E50914] focus:ring-1 focus:ring-red-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <Switch
                  checked={formData.is_veg}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_veg: checked })}
                  className="data-[state=checked]:bg-green-600"
                />
                <span className="text-xs font-bold text-slate-700">
                  {formData.is_veg ? '🌱 Pure Veg' : '🍗 Non-Veg'}
                </span>
              </div>

              <div>
                <Input
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="Badge (e.g. Bestseller)"
                  className="rounded-2xl h-11 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-[#E50914] hover:bg-red-700 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>{editingItem ? 'Save Changes' : 'Add to Plaza Menu'}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
