'use client'

import { use, useEffect } from 'react'
import { useCart } from '@/lib/cart-store'
import CustomerMenuPage from '@/app/menu/page'

export default function TablePage({ params }: { params: Promise<{ tableId: string }> }) {
  const resolvedParams = use(params)
  const { setTableNumber } = useCart()

  useEffect(() => {
    if (resolvedParams.tableId) {
      setTableNumber(resolvedParams.tableId)
    }
  }, [resolvedParams.tableId, setTableNumber])

  return <CustomerMenuPage />
}
