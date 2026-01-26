"use client"

import { Button } from "@/components/ui/button"
import { usePlannerStore } from "@/lib/planner-store"
import { X, Grid3x3, Pencil } from "lucide-react"

export function AreaPanel() {
  const { setShowAreaPanel, room } = usePlannerStore()

  if (!room) return null

  return (
    <div className="absolute left-4 top-20 z-10 w-48 rounded-lg bg-white p-4 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">Area</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAreaPanel(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <Grid3x3 className="mr-1 h-3 w-3" />
          Coverings
        </Button>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <Pencil className="mr-1 h-3 w-3" />
          Edit
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Name</span>
          <span className="font-medium">{room.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type</span>
          <span className="font-medium">{room.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Floor Height</span>
          <span className="font-medium">{room.floorHeight}mm</span>
        </div>
      </div>
    </div>
  )
}
