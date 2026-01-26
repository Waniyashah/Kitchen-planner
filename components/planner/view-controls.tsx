"use client"

import { Button } from "@/components/ui/button"
import { usePlannerStore } from "@/lib/planner-store"
import { Plus, Minus, HelpCircle } from "lucide-react"

const FloorViewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </svg>
)

const View3DIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" style={{ width: '30px', height: '30px' }}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
)

const WireframeIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" style={{ width: '30px', height: '30px' }}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
    <polyline points="7.5 19.79 7.5 14.6 3 12" />
    <polyline points="21 12 16.5 14.6 16.5 19.79" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const PerspectiveIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" style={{ width: '30px', height: '30px' }}>
    <path d="M2 6l10-4 10 4v12l-10 4L2 18V6z" />
    <path d="M12 2v20" />
  </svg>
)

const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
)

export function ViewControls() {
  const { zoom, viewMode } = usePlannerStore()

  const handleZoomIn = () => {
    usePlannerStore.setState((state) => ({ zoom: Math.min(state.zoom + 0.1, 2) }))
  }

  const handleZoomOut = () => {
    usePlannerStore.setState((state) => ({ zoom: Math.max(state.zoom - 0.1, 0.5) }))
  }

  return (
    <>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full border border-[#dfdfdf] bg-white hover:bg-[#f5f5f5] shadow-sm"
          onClick={handleZoomIn}
        >
          <Plus className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full border border-[#dfdfdf] bg-white hover:bg-[#f5f5f5] shadow-sm"
          onClick={handleZoomOut}
        >
          <Minus className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full border border-[#dfdfdf] bg-white hover:bg-[#f5f5f5] shadow-sm"
        >
          <LayersIcon />
        </Button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-[#dfdfdf] bg-white px-3 py-2 shadow-md">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-2 rounded-full px-3 ${viewMode === "2d" ? "bg-[#0051BA] text-white hover:bg-[#003d8f] hover:text-white" : "hover:bg-[#f5f5f5]"}`}
          onClick={() => usePlannerStore.setState({ viewMode: "2d" })}
        >
          <FloorViewIcon />
          <span className="text-xs font-medium">Floor view</span>
        </Button>

        <div className="h-6 w-px bg-[#dfdfdf]" />

        <Button
          variant="ghost"
          size="icon"
          className={`h-11 w-11 rounded-full ${viewMode === "2.5d" ? "bg-[#0051BA] text-white hover:bg-[#003d8f] hover:text-white" : "hover:text-[#0051BA] hover:bg-[#e6f0ff]"}`}
          onClick={() => usePlannerStore.setState({ viewMode: "2.5d" })}
        >
          <View3DIcon />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`h-11 w-11 rounded-full ${viewMode === "3d" ? "bg-[#0051BA] text-white hover:bg-[#003d8f] hover:text-white" : "hover:text-[#0051BA] hover:bg-[#e6f0ff]"}`}
          onClick={() => usePlannerStore.setState({ viewMode: "3d" })}
        >
          <WireframeIcon />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`h-11 w-11 rounded-full ${viewMode === "wireframe" ? "bg-[#0051BA] text-white hover:bg-[#003d8f] hover:text-white" : "hover:text-[#0051BA] hover:bg-[#e6f0ff]"}`}
          onClick={() => usePlannerStore.setState({ viewMode: "wireframe" })}
        >
          <PerspectiveIcon />
        </Button>
      </div>

      <div className="absolute bottom-6 right-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full border border-[#dfdfdf] bg-white hover:bg-[#f5f5f5] shadow-sm"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </>
  )
}
