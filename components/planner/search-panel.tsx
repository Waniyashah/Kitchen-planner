"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePlannerStore } from "@/lib/planner-store"
import { Search, X, Plus } from "lucide-react"

// Mock product data
const MOCK_PRODUCTS = [
  {
    id: "cab-001",
    name: "Base Cabinet 60cm",
    category: "Cabinets",
    width: 600,
    height: 720,
    depth: 600,
    price: "2,500 kr",
    ref: "KB-60-W",
  },
  {
    id: "cab-002",
    name: "Wall Cabinet 40cm",
    category: "Cabinets",
    width: 400,
    height: 720,
    depth: 350,
    price: "1,800 kr",
    ref: "WC-40-W",
  },
  {
    id: "sink-001",
    name: "Single Bowl Sink",
    category: "Sinks",
    width: 800,
    height: 200,
    depth: 450,
    price: "3,200 kr",
    ref: "SNK-80-SS",
  },
  {
    id: "app-001",
    name: "Dishwasher 60cm",
    category: "Appliances",
    width: 600,
    height: 820,
    depth: 600,
    price: "7,500 kr",
    ref: "DW-60-INT",
  },
  {
    id: "count-001",
    name: "Countertop Oak",
    category: "Countertops",
    width: 1200,
    height: 40,
    depth: 600,
    price: "4,800 kr",
    ref: "CT-OAK-120",
  },
]

export function SearchPanel() {
  const { setShowSearchPanel, addPlacedItem } = usePlannerStore()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = searchQuery
    ? MOCK_PRODUCTS.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
    : []

  const handleAddProduct = (product: (typeof MOCK_PRODUCTS)[0]) => {
    const newItem = {
      id: `item-${Date.now()}`,
      type: product.name,
      x: 1000, // Default position
      y: 1000,
      rotation: 0,
      width: product.width,
      height: product.depth,
      productRef: product.id,
    }
    addPlacedItem(newItem)
  }

  const handleDragStart = (e: React.DragEvent, product: (typeof MOCK_PRODUCTS)[0]) => {
    e.dataTransfer.setData("itemType", product.name)
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <div className="flex w-[400px] flex-col border-r border-[#dfdfdf] bg-white h-full shadow-lg z-40 fixed top-[160px] left-0 bottom-0">
      {/* Header with Icons */}
      <div className="flex items-center justify-end p-4 pb-0 gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={() => setShowSearchPanel(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Search Input Area */}
      <div className="px-5 pb-5 pt-2">
        <div className="relative">
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10 h-10 rounded-full border-gray-300 focus-visible:ring-[#0058a3]"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#111]" />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {!searchQuery ? (
          // Empty State (Centered Text)
          <div className="h-full flex flex-col items-center justify-center text-center -mt-20">
            <h3 className="text-[18px] font-bold text-[#111] mb-2">Search...</h3>
            <p className="text-[14px] text-gray-700">Search by product type, product name or reference.</p>
          </div>
        ) : (
          // Search Results
          <div>
            {filteredProducts.length === 0 ? (
              <div className="text-center mt-10 text-gray-500">
                No products found.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, product)}
                    className="group cursor-grab active:cursor-grabbing border border-gray-200 rounded p-4 hover:border-[#0058a3] flex flex-col gap-2 bg-white transition-all hover:shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-[#111] text-base leading-tight">{product.name}</div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{product.category}</div>
                    </div>
                    <div className="text-[13px] text-gray-600">Ref: {product.ref}</div>
                    <div className="text-xs text-gray-400">{product.width}×{product.depth}×{product.height} mm</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-[#111]">{product.price}</span>
                      <Button size="sm" variant="ghost" className="h-7 text-[#0058a3] hover:text-[#004f93] hover:bg-blue-50" onClick={() => handleAddProduct(product)}>
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
