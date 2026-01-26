import React from "react";
import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-100">
      <div className="h-1 bg-black"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Contact Section */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-gray-900">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <Link href="#" className="hover:text-blue-500 transition-colors">
                  Address
                </Link>
              </li>
              <li>
                <Link href="mailto:support@kitchenplanner.com" className="hover:text-blue-500 transition-colors">
                  Email
                </Link>
              </li>
              <li>
                <Link href="tel:+1234567890" className="hover:text-blue-500 transition-colors">
                  Phone
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-500 transition-colors">
                  Company portal
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-500 transition-colors">
                  Trade fairs
                </Link>
              </li>
            </ul>
          </div>

          {/* Cabinet & Drawer Interiors */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-gray-900">Cabinet & Drawer Interiors</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <Link href="/products" className="hover:text-blue-500 transition-colors">
                  Cabinets
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-blue-500 transition-colors">
                  Drawers
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-blue-500 transition-colors">
                  Interior organization
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-blue-500 transition-colors">
                  Shelving organization
                </Link>
              </li>
            </ul>
          </div>

          {/* Language & Social Media Combined */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-gray-900">Language</h3>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li>
                <Link href="#" className="hover:text-blue-500 transition-colors">
                  English
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-500 transition-colors">
                  Swedish
                </Link>
              </li>
            </ul>

            <h3 className="font-bold text-sm mb-4 text-gray-900">Social Media</h3>
            <div className="flex gap-3">
              <Link href="#" className="text-gray-700 hover:text-blue-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-700 hover:text-blue-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-700 hover:text-blue-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-gray-900">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <Link href="/privacy" className="hover:text-blue-500 transition-colors">
                  Legal notice
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-500 transition-colors">
                  Data privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-500 transition-colors">
                  Cookie policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-6">
          <p className="text-xs text-gray-600">© 2025 WASA Kitchens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
