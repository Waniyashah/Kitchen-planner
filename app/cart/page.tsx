"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ShoppingCart } from "@/components/cart/shopping-cart"

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ShoppingCart />
      </main>
      <Footer />
    </div>
  )
}
