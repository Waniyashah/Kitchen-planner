"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { usePlannerStore } from "@/lib/planner-store"
import { useState } from "react"
import { Info } from 'lucide-react'
import { DefineSpacePanel } from "./panels/define-space-panel"
import { ElementsPanel } from "./panels/elements-panel"
import { OpeningsPanel } from "./panels/openings-panel"


// ROOM SHAPE
const RoomShapeIcon = () => (
  <Image
    src="/icons/floor-plan-svgrepo-com.svg"
    alt="Room Shape"
    width={32}
    height={32}
    className="w-8 h-8 group-hover:[filter:invert(14%)_sepia(85%)_saturate(3665%)_hue-rotate(204deg)_brightness(96%)_contrast(101%)]"
  />
)

// DEFINE SPACE
const DefineSpaceIcon = () => (
  <Image
    src="/icons/connect-svgrepo-com.svg"
    alt="Define Space"
    width={32}
    height={32}
    className="w-8 h-8 group-hover:[filter:invert(14%)_sepia(85%)_saturate(3665%)_hue-rotate(204deg)_brightness(96%)_contrast(101%)]"
  />
)

// ELEMENTS
const ElementsIcon = () => (
  <Image
    src="/icons/3d-cube-svgrepo-com.svg"
    alt="Elements"
    width={32}
    height={32}
    className="w-8 h-8 group-hover:[filter:invert(14%)_sepia(85%)_saturate(3665%)_hue-rotate(204deg)_brightness(96%)_contrast(101%)]"
  />
)

// OPENINGS
const OpeningsIcon = () => (
  <Image
    src="/icons/window-svgrepo-com.svg"
    alt="Openings"
    width={32}
    height={32}
    className="w-8 h-8 group-hover:[filter:invert(14%)_sepia(85%)_saturate(3665%)_hue-rotate(204deg)_brightness(96%)_contrast(101%)]"
  />
)

// SEARCH
const SearchIcon = () => (
  <Image
    src="/icons/search-outline-svgrepo-com.svg"
    alt="Se"
    width={32}
    height={32}
    className="w-8 h-8 group-hover:[filter:invert(14%)_sepia(85%)_saturate(3665%)_hue-rotate(204deg)_brightness(96%)_contrast(101%)]"
  />
)

// WATER SUPPLY
const WaterSupplyIcon = () => (
  <Image
    src="/icons/plumbering-water-supply-svgrepo-com.svg"
    alt="Water Supply"
    width={32}
    height={32}
    className="w-8 h-8 group-hover:[filter:invert(14%)_sepia(85%)_saturate(3665%)_hue-rotate(204deg)_brightness(96%)_contrast(101%)]"
  />
)

// ... Baaki `PlannerToolbar` function waisa hi rahega

// ... (previous imports)

export function PlannerToolbar() {
  const { setShowRoomShapeModal, setShowSearchPanel, setShowWaterSupplyModal, room, setRoom } = usePlannerStore()
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null) // For Elements Sidebar
  const [showElementsMenu, setShowElementsMenu] = useState(false) // For Elements Dropdown
  const [activeOpeningCategory, setActiveOpeningCategory] = useState<string | null>(null) // For Openings Sidebar
  const [showOpeningsMenu, setShowOpeningsMenu] = useState(false) // For Openings Dropdown
  const [isEditingHeight, setIsEditingHeight] = useState(false)

  const handleCeilingHeightChange = (value: string) => {
    // ... (existing logic)
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue > 0) {
      if (room) {
        setRoom({ ...room, ceilingHeight: numValue })
      } else {
        setRoom({
          shape: "rectangle",
          width: 4000,
          height: 4000,
          name: "Area 1",
          type: "Kitchen",
          floorHeight: 0,
          ceilingHeight: numValue,
          area: 16,
        })
      }
    }
  }

  const handleElementCategoryClick = (category: string) => {
    setActiveCategory(category)
    setActivePanel("elements")
    setShowElementsMenu(false)
    setShowOpeningsMenu(false)
  }

  const handleOpeningCategoryClick = (category: string) => {
    setActiveOpeningCategory(category)
    setActivePanel("openings")
    setShowOpeningsMenu(false)
    setShowElementsMenu(false)
  }

  // Close menus when clicking outside logic could be added here, 
  // but for now relying on simple toggles as per prompt instructions.

  return (
    <div className="relative flex h-24 items-center justify-between border-b border-[#dfdfdf] bg-white pl-0 pr-4">

      {/* LEFT SIDE */}
      <div className="flex items-center h-full">

        {/* Group 1: Room Shape + Define Space */}
        <div className="flex items-center gap-1 pl-2">
          <Button variant="ghost"
            className="group flex flex-col items-center justify-center gap-2 h-auto py-2 px-2 hover:bg-transparent rounded-none"
            onClick={() => {
              setShowRoomShapeModal(true)
              setActivePanel(null)
              setShowElementsMenu(false)
            }}>
            <div className="border border-[#dfdfdf] p-3 rounded-sm w-14 h-14 flex items-center justify-center">
              <RoomShapeIcon />
            </div>
            <span className="text-[15px] font-medium group-hover:text-[#0058a3]">Room shape</span>
          </Button>

          <Button variant="ghost"
            className="group flex flex-col items-center justify-center gap-2 h-auto py-2 px-2 hover:bg-transparent rounded-none"
            onClick={() => {
              setActivePanel(activePanel === 'define-space' ? null : 'define-space')
              setShowElementsMenu(false)
            }}>
            <div className={`border ${activePanel === 'define-space' ? 'border-[#0058a3] bg-[#0058a3]/5' : 'border-[#dfdfdf]'} p-3 rounded-sm w-14 h-14 flex items-center justify-center`}>
              <DefineSpaceIcon />
            </div>
            <span className="text-[15px] font-medium group-hover:text-[#0058a3]">Define space</span>
          </Button>
        </div>

        {/* Separator */}
        <div className="h-16 w-px bg-[#dfdfdf] mx-4" />

        {/* Group 2: Elements, Openings, Search, Water Supply */}
        <div className="flex items-center gap-4">

          {/* ELEMENTS BUTTON + DROPDOWN wrapper */}
          <div className="relative">
            <Button variant="ghost"
              className="group flex flex-col items-center justify-center gap-2 py-2 px-2 hover:bg-transparent"
              onClick={() => {
                setShowElementsMenu(!showElementsMenu)
                setShowOpeningsMenu(false)
                setActivePanel(null) // Close sidebar if opening menu
              }}>
              <div className={`border ${showElementsMenu || activePanel === 'elements' ? 'border-[#0058a3] bg-[#0058a3]/5' : 'border-[#dfdfdf]'} p-3 rounded-sm w-14 h-14 flex items-center justify-center`}>
                <ElementsIcon />
              </div>
              <span className="text-[15px] group-hover:text-[#0058a3]">Elements</span>
            </Button>

            {/* ELEMENTS DROPDOWN MENU */}
            {showElementsMenu && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 rounded z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                {/* Tiny arrow pointing up */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>

                <div className="px-4 py-2 font-bold text-sm text-[#111]">Elements</div>
                <div className="h-px bg-gray-100 my-1"></div>

                <button onClick={() => handleElementCategoryClick('structure')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 text-gray-700 hover:text-[#0058a3]">Structures</button>
                <button onClick={() => handleElementCategoryClick('electricity')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 text-gray-700 hover:text-[#0058a3]">Electricity</button>
                <button onClick={() => handleElementCategoryClick('heating')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 text-gray-700 hover:text-[#0058a3]">Heating</button>
                <button onClick={() => handleElementCategoryClick('ventilation')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 text-gray-700 hover:text-[#0058a3]">Ventilation</button>
                <button onClick={() => handleElementCategoryClick('fitting')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 text-gray-700 hover:text-[#0058a3]">Fittings</button>
              </div>
            )}
          </div>

          {/* OPENINGS BUTTON + DROPDOWN wrapper */}
          <div className="relative">
            <Button variant="ghost"
              className="group flex flex-col items-center justify-center gap-2 py-2 px-2 hover:bg-transparent"
              onClick={() => {
                setShowOpeningsMenu(!showOpeningsMenu)
                setShowElementsMenu(false)
                setActivePanel(null)
              }}>
              <div className={`border ${showOpeningsMenu || activePanel === 'openings' ? 'border-[#0058a3] bg-[#0058a3]/5' : 'border-[#dfdfdf]'} p-3 rounded-sm w-14 h-14 flex items-center justify-center`}>
                <OpeningsIcon />
              </div>
              <span className="text-[15px] group-hover:text-[#0058a3]">Openings</span>
            </Button>

            {/* OPENINGS DROPDOWN MENU */}
            {showOpeningsMenu && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 rounded z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                {/* Tiny arrow pointing up */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>

                <div className="px-4 py-2 font-bold text-sm text-[#111]">Openings</div>
                <div className="h-px bg-gray-100 my-1"></div>

                <button onClick={() => handleOpeningCategoryClick('window')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 text-gray-700 hover:text-[#0058a3]">Windows</button>
                <button onClick={() => handleOpeningCategoryClick('door')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 text-gray-700 hover:text-[#0058a3]">Doors</button>
                <button onClick={() => handleOpeningCategoryClick('wall-opening')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 text-gray-700 hover:text-[#0058a3]">Wall openings</button>
              </div>
            )}
          </div>

          <Button variant="ghost"
            className="group flex flex-col items-center justify-center gap-2 py-2 px-2 hover:bg-transparent"
            onClick={() => {
              setShowSearchPanel(true)
              setActivePanel(null)
              setShowElementsMenu(false)
            }}>
            <div className="border border-[#dfdfdf] p-3 rounded-sm w-14 h-14 flex items-center justify-center">
              <SearchIcon />
            </div>
            <span className="text-[15px] group-hover:text-[#0058a3]">Search</span>
          </Button>

          <Button variant="ghost"
            className="group flex flex-col items-center justify-center gap-2 py-2 px-2 hover:bg-transparent"
            onClick={() => {
              setShowWaterSupplyModal(true)
              setActivePanel(null)
              setShowElementsMenu(false)
            }}>
            <div className="border border-[#dfdfdf] p-3 rounded-sm w-14 h-14 flex items-center justify-center">
              <WaterSupplyIcon />
            </div>
            <span className="text-[15px] group-hover:text-[#0058a3]">Water supply</span>
          </Button>
        </div>

        {/* SEPARATOR */}
        <div className="h-16 w-px bg-[#dfdfdf] mx-4" />

        {/* CEILING HEIGHT */}
        <div className="flex items-center gap-4 px-6">
          <span className="text-sm">Ceiling height</span>

          {isEditingHeight ? (
            <Input
              type="number"
              value={room?.ceilingHeight || 2500}
              onChange={(e) => handleCeilingHeightChange(e.target.value)}
              onBlur={() => setIsEditingHeight(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingHeight(false)
                if (e.key === 'Escape') setIsEditingHeight(false)
              }}
              className="w-28 h-10 text-sm border-[#dfdfdf]"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingHeight(true)}
              className="flex items-center justify-between w-32 h-10 px-3 text-sm bg-white border border-[#dfdfdf]">
              <span>{room?.ceilingHeight || 2500} mm</span>
            </button>
          )}
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-8 pr-4">
        <div className="flex flex-col items-end">
          <span className="text-sm">My Wasa kitchen</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">€0.00</span>
            <Info className="h-4 w-4 cursor-pointer" />
          </div>
        </div>

        <Button className="bg-[#0058a3] hover:bg-[#004f93] text-white px-8 h-10 rounded-full font-bold text-sm">
          Continue
        </Button>
      </div>

      {activePanel === "define-space" && (
        <DefineSpacePanel onClose={() => setActivePanel(null)} />
      )}
      {activePanel === "elements" && (
        <ElementsPanel onClose={() => setActivePanel(null)} initialCategory={activeCategory} />
      )}
      {activePanel === "openings" && (
        <OpeningsPanel onClose={() => setActivePanel(null)} initialCategory={activeOpeningCategory} />
      )}
    </div>
  )
}
