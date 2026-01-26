"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePlannerStore } from "@/lib/planner-store"
import { Plus, Minus } from "lucide-react"

interface DimensionEditorProps {
  dimension: "width" | "height"
  position: "top" | "left"
}

export function DimensionEditor({ dimension, position }: DimensionEditorProps) {
  const { room, updateRoomDimensions } = usePlannerStore()
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState("")

  if (!room) return null

  const value = dimension === "width" ? room.width : room.height
  const step = 100 // 10cm

  const handleIncrement = () => {
    const newValue = value + step
    if (dimension === "width") {
      updateRoomDimensions(newValue, room.height)
    } else {
      updateRoomDimensions(room.width, newValue)
    }
  }

  const handleDecrement = () => {
    const newValue = Math.max(1000, value - step)
    if (dimension === "width") {
      updateRoomDimensions(newValue, room.height)
    } else {
      updateRoomDimensions(room.width, newValue)
    }
  }

  const handleStartEdit = () => {
    setIsEditing(true)
    setInputValue(value.toString())
  }

  const handleConfirmEdit = () => {
    const newValue = Number.parseInt(inputValue)
    if (!isNaN(newValue) && newValue >= 1000) {
      if (dimension === "width") {
        updateRoomDimensions(newValue, room.height)
      } else {
        updateRoomDimensions(room.width, newValue)
      }
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirmEdit()
    } else if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  if (position === "top") {
    return (
      <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
        <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={handleDecrement}>
          <Minus className="h-4 w-4" />
        </Button>
        {isEditing ? (
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleConfirmEdit}
            onKeyDown={handleKeyDown}
            className="h-8 w-24 text-center text-sm"
            autoFocus
          />
        ) : (
          <button
            onClick={handleStartEdit}
            className="min-w-[80px] rounded px-2 py-1 text-center text-sm font-medium hover:bg-accent"
          >
            {value} mm
          </button>
        )}
        <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={handleIncrement}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="absolute left-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
      <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={handleIncrement}>
        <Plus className="h-4 w-4" />
      </Button>
      {isEditing ? (
        <Input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleConfirmEdit}
          onKeyDown={handleKeyDown}
          className="h-24 w-8 text-center text-sm [writing-mode:vertical-lr]"
          autoFocus
        />
      ) : (
        <button
          onClick={handleStartEdit}
          className="min-w-[80px] -rotate-90 whitespace-nowrap rounded px-2 py-1 text-center text-sm font-medium hover:bg-accent"
        >
          {value} mm
        </button>
      )}
      <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={handleDecrement}>
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  )
}
