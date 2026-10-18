import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Item, Order } from './types'

interface CartState {
  items: CartItem[]
  tableNumber: string | number
  orderNotes: string
  isCartOpen: boolean
  isCheckoutOpen: boolean
  lastOrder: Order | null
  
  // Actions
  addItem: (item: Item) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  setTableNumber: (table: string | number) => void
  setOrderNotes: (notes: string) => void
  setIsCartOpen: (open: boolean) => void
  setIsCheckoutOpen: (open: boolean) => void
  setLastOrder: (order: Order | null) => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: '4',
      orderNotes: '',
      isCartOpen: false,
      isCheckoutOpen: false,
      lastOrder: null,

      addItem: (item) => {
        const currentItems = get().items
        const existingItem = currentItems.find((i) => i.id === item.id)

        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...currentItems, { ...item, quantity: 1 }] })
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.id !== itemId) })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [], orderNotes: '' }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },

      setTableNumber: (tableNumber) => set({ tableNumber }),
      setOrderNotes: (orderNotes) => set({ orderNotes }),
      setIsCartOpen: (isCartOpen) => set({ isCartOpen }),
      setIsCheckoutOpen: (isCheckoutOpen) => set({ isCheckoutOpen }),
      setLastOrder: (lastOrder) => set({ lastOrder }),
    }),
    {
      name: 'plazabite-foodcourt-cart',
    }
  )
)
