"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCatalog } from "@/components/products/catalog"
import { useState } from "react"

export default function ProductsPage() {
  const [cart, setCart] = useState<any[]>([])

  const handleAddToCart = (product: any) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ProductCatalog onAddToCart={handleAddToCart} cartCount={cart.length} />
      </main>
      <Footer />
    </div>
  )
}
