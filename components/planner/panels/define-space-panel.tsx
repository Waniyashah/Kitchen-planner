"use client"

import { Button } from "@/components/ui/button"
import { usePlannerStore } from "@/lib/planner-store"
import { useState } from "react"

interface DefineSpacePanelProps {
  onClose: () => void
}

export function DefineSpacePanel({ onClose }: DefineSpacePanelProps) {
  const { setActiveTool, activeTool } = usePlannerStore()
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)

  const handleToolSelect = (tool: "wall" | "separation" | "ceiling") => {
    setActiveTool(tool)
    onClose()
  }

  const textClass = (tool: string) =>
    activeTool === tool || hoveredTool === tool
      ? "text-[#0051BA] text-sm"
      : "text-sm text-[#111]"

  return (
    <div className="absolute left-4 top-full z-50 mt-2 w-56 rounded-lg border border-border bg-white p-3 shadow-xl">
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full flex items-center gap-3 justify-start bg-transparent border-none hover:bg-transparent focus:bg-transparent active:bg-transparent"
          onClick={() => handleToolSelect("wall")}
          onMouseEnter={() => setHoveredTool("wall")}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <span className={textClass("wall")}>Add a wall</span>
        </Button>

        <Button
          variant="ghost"
          className="w-full flex items-center gap-3 justify-start bg-transparent border-none hover:bg-transparent focus:bg-transparent active:bg-transparent"
          onClick={() => handleToolSelect("separation")}
          onMouseEnter={() => setHoveredTool("separation")}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <span className={textClass("separation")}>Add an area separation</span>
        </Button>

        <Button
          variant="ghost"
          className="w-full flex items-center gap-3 justify-start bg-transparent border-none hover:bg-transparent focus:bg-transparent active:bg-transparent"
          onClick={() => handleToolSelect("ceiling")}
          onMouseEnter={() => setHoveredTool("ceiling")}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <span className={textClass("ceiling")}>Add a sloped ceiling</span>
        </Button>
      </div>
    </div>
  )
}
