"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

// Expand RoomShapeType to include variants used across the app
export type RoomShapeType =
  | "square"
  | "rectangle"
  | "lshape"
  | "ushape"
  | "gshape"
  | "lshapeopenspace"
  | "open-l"
  | "open-u"

interface PlannerState {
  roomShape: RoomShapeType | null
  ceilingHeight: number
  roomWidth: number
  roomHeight: number
  elements: Array<any>
}

interface PlannerContextType {
  state: PlannerState
  setRoomShape: (shape: RoomShapeType) => void
  updateCeiling: (height: number) => void
  updateDimensions: (width: number, height: number) => void
  addElement: (el: any) => void
  removeElement: (id: string) => void
  moveElement: (id: string, x: number, y: number) => void
  calculateArea: () => number
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined)

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlannerState>({
    roomShape: null,
    ceilingHeight: 2.6,
    roomWidth: 4,
    roomHeight: 3,
    elements: [],
  })

  const setRoomShape = (shape: RoomShapeType) => {
    setState((prev) => ({ ...prev, roomShape: shape }))
  }

  const updateCeiling = (height: number) => {
    setState((prev) => ({ ...prev, ceilingHeight: height }))
  }

  const updateDimensions = (width: number, height: number) => {
    setState((prev) => ({ ...prev, roomWidth: width, roomHeight: height }))
  }

  const addElement = (el: any) => setState((prev) => ({ ...prev, elements: [...prev.elements, el] }))

  const removeElement = (id: string) =>
    setState((prev) => ({ ...prev, elements: prev.elements.filter((e) => e.id !== id) }))

  const moveElement = (id: string, x: number, y: number) =>
    setState((prev) => ({ ...prev, elements: prev.elements.map((e) => (e.id === id ? { ...e, x, y } : e)) }))

  const calculateArea = () => state.roomWidth * state.roomHeight

  return (
    <PlannerContext.Provider
      value={{
        state,
        setRoomShape,
        updateDimensions,
        updateCeiling,
        addElement,
        removeElement,
        moveElement,
        calculateArea,
      }}
    >
      {children}
    </PlannerContext.Provider>
  )
}

export function usePlanner() {
  const context = useContext(PlannerContext)
  if (!context) {
    throw new Error("usePlanner must be used within PlannerProvider")
  }
  return context
}
