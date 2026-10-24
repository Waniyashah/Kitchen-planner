"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCatalog } from "@/components/products/catalog"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

export default function ProductsPage() {
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("cart")
    if (saved) {
      try {
        setCart(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  const handleAddToCart = (product: any) => {
    let nextCart: any[]
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      nextCart = cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      nextCart = [...cart, { ...product, quantity: 1 }]
    }
    setCart(nextCart)
    localStorage.setItem("cart", JSON.stringify(nextCart))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 relative">
        <ProductCatalog onAddToCart={handleAddToCart} cartCount={cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} />
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <Link
              href="/cart"
              className="flex items-center gap-3 bg-black text-white px-5 py-3 rounded-full shadow-2xl hover:bg-gray-800 transition transform hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold text-sm">View Cart ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})</span>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
