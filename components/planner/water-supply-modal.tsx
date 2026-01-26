"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { usePlannerStore } from "@/lib/planner-store"
import { X, Droplet } from "lucide-react"

export function WaterSupplyModal() {
  const { setShowWaterSupplyModal, room, addWaterSupply, waterSupplies } = usePlannerStore()
  const [tempSupplies, setTempSupplies] = useState<
    { x: number; y: number; wall: "top" | "right" | "bottom" | "left"; relX: number; relY: number }[]
  >([])

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!room) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Determine which wall is closest
    const relX = x / rect.width
    const relY = y / rect.height

    let wall: "top" | "right" | "bottom" | "left" = "top"
    const distToTop = relY
    const distToBottom = 1 - relY
    const distToLeft = relX
    const distToRight = 1 - relX

    const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight)
    if (minDist === distToTop) wall = "top"
    else if (minDist === distToBottom) wall = "bottom"
    else if (minDist === distToLeft) wall = "left"
    else wall = "right"

    // Snap to wall position
    let snappedX = x
    let snappedY = y
    const margin = 30

    if (wall === "top") snappedY = margin
    else if (wall === "bottom") snappedY = rect.height - margin
    else if (wall === "left") snappedX = margin
    else snappedX = rect.width - margin

    setTempSupplies([...tempSupplies, { x: snappedX, y: snappedY, wall, relX, relY }])
  }

  const handleConfirm = () => {
    if (!room) return

    tempSupplies.forEach((supply) => {
      // Convert to room coordinates
      const roomX = supply.relX * room.width
      const roomY = supply.relY * room.height

      addWaterSupply({
        id: `water-${Date.now()}-${Math.random()}`,
        x: roomX,
        y: roomY,
        wall: supply.wall,
      })
    })
    setShowWaterSupplyModal(false)
  }

  const handleRemoveLast = () => {
    setTempSupplies(tempSupplies.slice(0, -1))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl rounded-sm bg-white p-6 shadow-xl animate-in zoom-in-95 duration-300">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="title mb-2">Place your water supply</h2>
            <p className="text-sm text-[#807f7f]">Select the wall of your water supply to determine sink placement</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowWaterSupplyModal(false)}
            className="hover:bg-[#ededed]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div
          className="relative mx-auto aspect-square w-full max-w-lg cursor-crosshair rounded-sm border-4 border-[#e0e0e0] bg-[#f5dcc4]"
          onClick={handleCanvasClick}
        >
          {room && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-medium">{room.name}</div>
                <div className="text-sm text-muted-foreground">{room.area.toFixed(0)} m²</div>
              </div>
            </div>
          )}

          {/* Existing water supplies */}
          {room &&
            waterSupplies.map((supply, idx) => {
              const relX = supply.x / room.width
              const relY = supply.y / room.height
              return (
                <div
                  key={idx}
                  className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-100"
                  style={{
                    left: `${relX * 100}%`,
                    top: `${relY * 100}%`,
                  }}
                >
                  <Droplet className="h-4 w-4 fill-blue-600 text-blue-600" />
                </div>
              )
            })}

          {/* Temporary water supplies */}
          {tempSupplies.map((supply, idx) => (
            <div
              key={`temp-${idx}`}
              className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-white"
              style={{ left: supply.x, top: supply.y }}
            >
              <Droplet className="h-4 w-4 fill-primary text-primary" />
            </div>
          ))}

          {/* Wall labels */}
          <div className="absolute left-1/2 top-2 -translate-x-1/2 text-xs font-medium text-[#807f7f]">Top Wall</div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-[#807f7f]">
            Bottom Wall
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-[#807f7f]">
            Left Wall
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-xs font-medium text-[#807f7f]">
            Right Wall
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="secondary" onClick={handleRemoveLast} disabled={tempSupplies.length === 0}>
            Remove Last
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowWaterSupplyModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={tempSupplies.length === 0}>
              Confirm ({tempSupplies.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
