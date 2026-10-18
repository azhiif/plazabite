import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Shop } from '@/lib/types'
import { Utensils } from 'lucide-react'

export function ShopCard({ shop, tableId }: { shop: Shop; tableId: string }) {
  return (
    <Link href={`/t/${tableId}/s/${shop.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow border-none bg-white">
        <div className="relative aspect-video w-full bg-muted">
          {shop.image_url ? (
            <Image
              src={shop.image_url}
              alt={shop.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Utensils className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-lg text-foreground">{shop.name}</h3>
            <p className="text-sm text-muted-foreground">{shop.category}</p>
            <div className="mt-2 text-primary text-sm font-semibold flex items-center gap-1">
              View Menu
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
