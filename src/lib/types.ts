export type FoodCourt = {
  id: string
  name: string
  slug: string
  location?: string
  city?: string
  address?: string
  admin_pin?: string
  total_tables?: number
  tables_count?: number
  created_at?: string
}

export type Shop = {
  id: string
  food_court_id?: string
  food_court_name?: string
  name: string
  slug?: string
  category: string
  image_url?: string
  logo_url?: string
  banner_url?: string
  rating?: number
  estimated_time?: string
  pin?: string
  phone?: string
  upi_id?: string
  status?: 'pending' | 'accepted' | 'rejected'
  is_open?: boolean
  description?: string
  created_at?: string
}

export type Item = {
  id: string
  shop_id: string
  shop_name?: string
  name: string
  price: number
  description?: string
  image_url?: string
  category: string
  is_available: boolean
  is_veg?: boolean
  rating?: number
  reviews_count?: number
  tag?: string
  created_at?: string
}

export type CartItem = Item & {
  quantity: number
}

export type Order = {
  id: string
  food_court_id?: string
  table_id?: string
  table_number?: number | string
  dining_option?: 'dine_in' | 'takeaway'
  shop_id: string
  shop_name?: string
  customer_name: string
  phone: string
  customer_phone?: string
  notes?: string
  total: number
  payment_status: 'Pending' | 'Paid'
  order_status: 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Delivered'
  otp_verified?: boolean
  items?: CartItem[]
  order_items?: any[]
  created_at: string
}

export type Banner = {
  id: string
  food_court_id?: string
  title: string
  subtitle?: string
  badge?: string
  image_url: string
  accent?: string
  sort_order?: number
  created_at?: string
}

