"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

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
          <Link href="/" className="flex items-center">
            <Image
              src="/kitchen-by-wasa-logo.png"
              alt="Kitchen by WASA"
              width={120}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/about" className="nav-link relative text-sm font-medium text-black transition-colors">
              About WASA
            </Link>
            <Link href="/designer" className="nav-link relative text-sm font-medium text-black transition-colors">
              Start Designing
            </Link>
            <Link href="/dashboard" className="nav-link relative text-sm font-medium text-black transition-colors">
              My Saved Designs
            </Link>
            <Link href="/book-meeting" className="nav-link relative text-sm font-medium text-black transition-colors">
              Book a Design Meeting
            </Link>
            <Link href="/contact" className="nav-link relative text-sm font-medium text-black transition-colors">
              Contact
            </Link>
          </nav>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              href="/about"
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              About WASA
            </Link>
            <Link
              href="/designer"
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Start Designing
            </Link>
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              My Saved Designs
            </Link>
            <Link
              href="/book-meeting"
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Book a Design Meeting
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Contact
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
