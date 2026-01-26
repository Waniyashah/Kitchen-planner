"use client"
import { PlannerHeader } from "./planner/planner-header"
import { PlannerCanvas } from "./planner/planner-canvas"
import { PlannerToolbar } from "./planner/planner-toolbar"
import { SearchPanel } from "./planner/search-panel"
import { AreaPanel } from "./planner/area-panel"
import { RoomShapeModal } from "./planner/room-shape-modal"
import { SuggestionsModal } from "./planner/suggestions-modal"
import { WaterSupplyModal } from "./planner/water-supply-modal"
import { usePlannerStore } from "@/lib/planner-store"
import { useEffect } from "react"
import { useAnswers } from "@/context/AnswerContext"

export function KitchenPlanner() {
  const { showRoomShapeModal, showSuggestionsModal, showWaterSupplyModal, showSearchPanel, showAreaPanel, room, setRoom } =
    usePlannerStore()
  const { answers } = useAnswers()

  useEffect(() => {
    // If planner has no room but the user previously chose a layout in the questionnaire,
    // initialize the planner room so the Define page shows the selected shape.
    console.debug("[KitchenPlanner] effect start", { room, answersLayout: answers.layout })
    // Check localStorage for existing persisted planner state to avoid overwriting it
    const stored = typeof window !== "undefined" ? localStorage.getItem("kitchen-planner-storage") : null
    let hasStoredRoom = false
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        console.debug("[KitchenPlanner] stored planner key", parsed)
        if (parsed && parsed.state && parsed.state.room) {
          hasStoredRoom = true
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    if (!room && answers.layout && !hasStoredRoom) {
      const mapLayoutToShape: Record<string, import("@/lib/planner-store").RoomShape> = {
        "single-wall": "rectangle",
        "l-shaped": "l-shape",
        "u-shaped": "u-shape",
        "two-wall": "open-l",
        island: "custom",
        custom: "custom",
      }

      const shape = mapLayoutToShape[answers.layout] || "rectangle"

      setRoom({
        shape,
        width: 4000,
        height: 4000,
        name: "Area 1",
        type: "Kitchen",
        floorHeight: 0,
        ceilingHeight: 2500,
        area: 16,
      })
      console.debug("[KitchenPlanner] setRoom called from answers.layout", { shape })
    }
  }, [answers.layout, room, setRoom])

  return (
    <div className="flex h-full w-full flex-col bg-[#f5f5f5]">
      <PlannerHeader activeStep="define" />
      <PlannerToolbar />

      <div className="relative flex flex-1 overflow-hidden">
        {showSearchPanel && <SearchPanel />}
        {showAreaPanel && <AreaPanel />}

        <div className="flex-1">
          <PlannerCanvas />
        </div>
      </div>

      {showRoomShapeModal && <RoomShapeModal />}
      {showSuggestionsModal && <SuggestionsModal />}
      {showWaterSupplyModal && <WaterSupplyModal />}
    </div>
  )
}
