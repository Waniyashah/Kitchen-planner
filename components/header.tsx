"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, ShoppingCart } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      const stored = localStorage.getItem("cart")
      if (stored) {
        try {
          const items = JSON.parse(stored)
          const total = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
          setCartCount(total)
        } catch {
          setCartCount(0)
        }
      } else {
        setCartCount(0)
      }
    }

    updateCount()
    window.addEventListener("storage", updateCount)
    return () => window.removeEventListener("storage", updateCount)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-300">
      <style>{`
        @keyframes underline-expand {
          from {
            width: 0%;
            left: 0;
          }
          to {
            width: 100%;
            left: 0;
          }
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0%;
          height: 2px;
          background-color: currentColor;
          transition: width 0.3s ease;
        }
        
        .nav-link:hover::after {
          animation: underline-expand 0.3s ease forwards;
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/kitchen-by-wasa-logo.png"
              alt="Kitchen by WASA"
              width={120}
              height={80}
              className="h-14 sm:h-16 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/about" className="nav-link relative text-sm font-medium text-black transition-colors whitespace-nowrap">
              About WASA
            </Link>
            <Link href="/designer" className="nav-link relative text-sm font-medium text-black transition-colors whitespace-nowrap">
              Start Designing
            </Link>
            <Link href="/products" className="nav-link relative text-sm font-medium text-black transition-colors whitespace-nowrap">
              Products
            </Link>
            <Link href="/gallery" className="nav-link relative text-sm font-medium text-black transition-colors whitespace-nowrap">
              Gallery
            </Link>
            <Link href="/dashboard" className="nav-link relative text-sm font-medium text-black transition-colors whitespace-nowrap">
              My Saved Designs
            </Link>
            <Link href="/book-meeting" className="nav-link relative text-sm font-medium text-black transition-colors whitespace-nowrap">
              Book a Design Meeting
            </Link>
            <Link href="/contact" className="nav-link relative text-sm font-medium text-black transition-colors whitespace-nowrap">
              Contact
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-black"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="lg:hidden pb-4 space-y-1 border-t border-gray-100 pt-3">
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              About WASA
            </Link>
            <Link
              href="/designer"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Start Designing
            </Link>
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Products
            </Link>
            <Link
              href="/gallery"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Gallery
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              My Saved Designs
            </Link>
            <Link
              href="/book-meeting"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Book a Design Meeting
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors font-semibold"
            >
              Shopping Cart {cartCount > 0 ? `(${cartCount})` : ""}
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
