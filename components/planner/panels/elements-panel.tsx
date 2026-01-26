"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronRight,
  Search,
  X,
  Maximize2,
  Box,
  Columns,
  Zap,
  Flame,
  Wind,
  Wrench,
  ArrowLeft
} from "lucide-react"

interface ElementsPanelProps {
  onClose: () => void
  initialCategory?: string | null
}

const ELEMENT_CATEGORIES = [
  { id: "structure", label: "Structures", icon: Box },
  { id: "electricity", label: "Electricity", icon: Zap },
  { id: "heating", label: "Heating", icon: Flame },
  { id: "ventilation", label: "Ventilation", icon: Wind },
  { id: "fitting", label: "Fittings", icon: Wrench },
]

// Dummy data for items
const ELEMENT_ITEMS: Record<string, Array<{ title: string; description: string; imageColor: string; image: string }>> = {
  structure: [
    { title: "Box object", description: "Resizable structure element", imageColor: "bg-gray-100", image: "/boxobject.jpeg" },
    { title: "Column round", description: "Resizable structure", imageColor: "bg-gray-100", image: "/columnround.jpeg" },
    { title: "Column square", description: "Resizable structure element", imageColor: "bg-gray-100", image: "/columnsquare.jpeg" },
  ],
  electricity: [
    { title: "Double electric socket", description: "Resizable element", imageColor: "bg-yellow-50", image: "/doublesocket.jpeg" },
    { title: "Double light switch", description: "Resizable element", imageColor: "bg-yellow-50", image: "/doubleswitch.jpeg" },
    { title: "Single electric socket", description: "Resizable element", imageColor: "bg-yellow-50", image: "/singlesocket.jpeg" },
    { title: "Single light switch", description: "Resizable element", imageColor: "bg-yellow-50", image: "/singleswitch.jpeg" },
  ],
  heating: [
    { title: "Radiator", description: "Resizable element", imageColor: "bg-red-50", image: "/radiator.jpeg" },

  ],
  ventilation: [
    { title: "Air vent", description: "Resizable Ventilation Element", imageColor: "bg-blue-50", image: "/airvent.jpeg" },

  ],
  fitting: [
    { title: "floor drain", description: "Resizable Fitting", imageColor: "bg-orange-50", image: "/floordrain.jpeg" },
    { title: "Horizontal gas pipe", description: "Resizable Fitting", imageColor: "bg-orange-50", image: "/horizontalgaspipe.jpeg" },
    { title: "Vertical gas pipe", description: "Resizable Fitting", imageColor: "bg-orange-50", image: "/verticalgaspipe.jpeg" },
    { title: "horizontal pipe", description: "Resizable Fitting", imageColor: "bg-orange-50", image: "/horizontalpipe.jpeg" },
    { title: "Vertical pipe", description: "Resizable Fitting", imageColor: "bg-orange-50", image: "/verticalpipe.jpeg" },
    { title: "horizontal water pipe", description: "Resizable Fitting", imageColor: "bg-orange-50", image: "/horizontalwaterpipe.jpeg" },
    { title: "Vertical water pipe", description: "Resizable Fitting", imageColor: "bg-orange-50", image: "/verticalwaterpipe.jpeg" },
    { title: "Water trap/strainer", description: "Resizable Fitting", imageColor: "bg-orange-50", image: "/verticalwaterpipe.jpeg" },

  ],
}

export function ElementsPanel({ onClose, initialCategory }: ElementsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory)
    }
  }, [initialCategory])

  const handleDragStart = (e: React.DragEvent, itemType: string) => {
    e.dataTransfer.setData("itemType", itemType)
    e.dataTransfer.effectAllowed = "copy"
  }

  const categoryLabel = selectedCategory
    ? ELEMENT_CATEGORIES.find(c => c.id === selectedCategory)?.label
    : ""

  const items = selectedCategory ? ELEMENT_ITEMS[selectedCategory] || [] : []
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    // Fixed sidebar positioning
    <div className="fixed left-0 top-[160px] bottom-0 w-[400px] border-r border-[#dfdfdf] bg-white shadow-lg z-40 flex flex-col">

      {/* Header Section */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-bold text-[#111]">Add an existing element</h2>
          <div className="flex items-center gap-2">

            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>



        {/* Search Bar - Only show when category is selected or maybe always? 
            Screenshot shows usage inside a category. matching that.
        */}
        {selectedCategory && (
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search"
              className="pl-4 pr-10 h-10 rounded-full border-gray-300 focus-visible:ring-[#0058a3]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {!selectedCategory ? (
          // Category List View
          <div className="space-y-1">
            {ELEMENT_CATEGORIES.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-[#0058a3] group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-[#111]">{category.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-800" />
                </button>
              )
            })}
          </div>
        ) : (
          // Items List View
          <div className="space-y-4">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, item.title)}
                className="group cursor-grab active:cursor-grabbing border border-gray-200 rounded p-4 hover:border-[#0058a3] flex gap-4 bg-white transition-all hover:shadow-sm"
              >
                {/* Image Placeholder */}
                <div className="w-36 h-28 flex-shrink-0 rounded-sm overflow-hidden bg-white flex items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col pt-1 flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="font-bold text-[#111] text-base leading-tight">{item.title}</span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center text-[10px] text-gray-500">i</div>
                    </button>
                  </div>
                  <p className="text-[13px] text-gray-600 leading-tight">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
