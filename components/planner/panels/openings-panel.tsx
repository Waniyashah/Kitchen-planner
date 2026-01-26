"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  ChevronRight,
  Search,
  X,
  AppWindow,
  DoorOpen,
  Square,
  Box
} from "lucide-react"

interface OpeningsPanelProps {
  onClose: () => void
  initialCategory?: string | null
}

const OPENING_CATEGORIES = [
  { id: "window", label: "Windows", icon: AppWindow },
  { id: "door", label: "Doors", icon: DoorOpen },
  { id: "wall-opening", label: "Wall openings", icon: Square },
]

// Dummy data for items
const OPENING_ITEMS: Record<string, Array<{ title: string; description: string; imageColor: string; image: string }>> = {
  window: [
    { title: "Double window", description: "Resizable double window", imageColor: "bg-blue-50", image: "/doublewindow.jpeg" },
    { title: "Single window", description: "Standard single window", imageColor: "bg-blue-50", image: "/singlewindow.jpeg" },
    { title: "Double window", description: "Resizable double window", imageColor: "bg-blue-50", image: "/doublewindow2.jpeg" },
    { title: "Roof Window", description: "Resizable roof window, for sloped ceiling only", imageColor: "bg-blue-50", image: "/roofwindow.jpeg" },
    { title: "Non opening window", description: "Fixed resizable window", imageColor: "bg-blue-50", image: "/nonopeningwindow.jpeg" },
  ],
  door: [
    { title: "Double Interior door", description: "Resizable double interior door", imageColor: "bg-green-50", image: "/doubleinteriordoor.jpeg" },
    { title: "Patio Door", description: "Resizable patio door", imageColor: "bg-green-50", image: "/patiodoor.jpeg" },
    { title: "Simple door", description: "Resizable interior door", imageColor: "bg-green-50", image: "/simpledoor.jpeg" },
  ],
  "wall-opening": [
    { title: "Wall Opening", description: "Resizable Interior opening", imageColor: "bg-gray-100", image: "/wallopening.jpeg" },

  ],
}

export function OpeningsPanel({ onClose, initialCategory }: OpeningsPanelProps) {
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

  const items = selectedCategory ? OPENING_ITEMS[selectedCategory] || [] : []
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    // Fixed sidebar positioning
    <div className="fixed left-0 top-[160px] bottom-0 w-[400px] border-r border-[#dfdfdf] bg-white shadow-lg z-40 flex flex-col">

      {/* Header Section */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-[#111]">Add an opening</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search Bar - Only show when category is selected or maybe always? 
            Matching ElementsPanel logic: show when category selected
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
            {OPENING_CATEGORIES.map((category) => {
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
