"use client"

import { useAnswers } from "@/context/AnswerContext"
import { useRouter } from "next/navigation"

export default function SummaryPage() {
  const { answers } = useAnswers()
  const router = useRouter()

  const layoutOptions: Record<string, { label: string; img: string }> = {
    "single-wall": { label: "Single-Wall", img: "/kitchen-single-wall.png" },
    "l-shaped": { label: "L-Shaped", img: "/l-shaped-kitchen.png" },
    "u-shaped": { label: "U-Shaped", img: "/u-shaped-kitchen.png" },
    "two-wall": { label: "Two-Wall", img: "/two-wall-kitchen.png" },
    island: { label: "Island", img: "/island-form-kitchen.png" },
    custom: { label: "Custom", img: "/custom-planning.png" },
  }

  const ovenOptions: Record<string, { label: string; img?: string }> = {
    under: { label: "Under the Worktop", img: "/oven1.png" },
    tall: { label: "In a tall cabinet", img: "/oven2.png" },
  }

  const hoodOptions: Record<string, { label: string; img?: string }> = {
    integrated: { label: "Integrated", img: "/hood1.png" },
    wall: { label: "Wall / Ceiling mounted", img: "/hood2.png" },
  }

  const fridgeOptions: Record<string, { label: string; img?: string }> = {
    integrated: { label: "Integrated", img: "/fridge1.jpeg" },
    freestanding: { label: "Freestanding", img: "/fridge2.jpeg" },
  }

  const summaryItems = [
    {
      key: "oven",
      title: "Oven",
      category: "OVEN",
      selectedValue: answers.oven,
      label: ovenOptions[answers.oven]?.label || "Under the Worktop",
      img: ovenOptions[answers.oven]?.img || "/placeholder.svg",
      route: "/oven",
    },
    {
      key: "hood",
      title: "Extractor Hood",
      category: "HOOD",
      selectedValue: answers.hood,
      label: hoodOptions[answers.hood]?.label || "Integrated",
      img: hoodOptions[answers.hood]?.img || "/placeholder.svg",
      route: "/hood",
    },
    {
      key: "fridge",
      title: "Fridge / Freezer",
      category: "FRIDGE",
      selectedValue: answers.fridge,
      label: fridgeOptions[answers.fridge]?.label || "Integrated",
      img: fridgeOptions[answers.fridge]?.img || "/placeholder.svg",
      route: "/fridge",
    },
    {
      key: "layout",
      title: "Kitchen Layout",
      category: "KITCHEN LAYOUT",
      selectedValue: answers.layout,
      label: layoutOptions[answers.layout]?.label || "Single-Wall",
      img: layoutOptions[answers.layout]?.img || "/kitchen-single-wall.png",
      route: "/",
    },
  ]

  return (
    <div className="min-h-screen px-4 py-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="text-gray-700 hover:text-gray-900 flex items-center mb-8 font-medium"
        >
          ← Start Page
        </button>

        <div className="mb-12">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Question 4 of 4</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-3">SUMMARY</h1>
          <p className="text-gray-600 text-sm">Select an Option if you'd like to change it</p>
        </div>

        <div className="flex gap-6 mb-16 overflow-x-auto pb-4">
          {summaryItems.map((item) => (
            <div
              key={item.key}
              onClick={() => router.push(item.route)}
              className="flex-shrink-0 text-center cursor-pointer group"
            >
              {/* Thumbnail Image */}
              <div className="w-40 h-40 rounded-md flex items-center justify-center mb-3 overflow-hidden border border-gray-300 bg-white">
                <img
                  src={item.img || "/placeholder.svg"}
                  alt={item.label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ; (e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                />
              </div>
              {/* Label */}
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.label}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">{item.category}</p>
              {/* Change Button */}
              <button className="text-xs font-medium text-gray-900 border-b border-gray-900 hover:text-gray-600 whitespace-nowrap">
                Change {item.category.toLowerCase()} →
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-900 font-medium mb-6">Now, Let's add your measurements</p>
          <button
            onClick={() => router.push("/define")}
            className="px-12 py-4 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition text-lg"
          >
            Define your Space →
          </button>
        </div>
      </div>
    </div>
  )
}
