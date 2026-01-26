import { create } from "zustand"
import { persist } from "zustand/middleware"

export type RoomShape = "square" | "rectangle" | "l-shape" | "u-shape" | "open-l" | "custom"
export type ViewMode = "2d" | "2.5d" | "3d" | "wireframe"
export type Tool = "select" | "wall" | "separation" | "ceiling" | "water-supply"

export interface Room {
  shape: RoomShape
  width: number
  height: number
  name: string
  type: string
  floorHeight: number
  ceilingHeight: number
  area: number
  params?: { [key: string]: number }
}

export interface PlacedItem {
  id: string
  type: string
  x: number
  y: number
  rotation: number
  width: number
  height: number
  productRef?: string
}

export interface WaterSupply {
  id: string
  x: number
  y: number
  wall: "top" | "right" | "bottom" | "left"
}

export interface SlopedCeiling {
  id: string
  wallId: string // "top", "right", "bottom", "left" or specific wall segment id
  a: number // height from floor? or height of knee wall?
  b: number // distance from wall
  c: number // angle?
}

interface HistoryState {
  room: Room | null
  placedItems: PlacedItem[]
  waterSupplies: WaterSupply[]
  slopedCeilings: SlopedCeiling[]
}

interface PlannerState {
  showRoomShapeModal: boolean
  showSuggestionsModal: boolean
  showWaterSupplyModal: boolean
  showSearchPanel: boolean
  showAreaPanel: boolean
  showViewModeOptions: boolean

  room: Room | null
  viewMode: ViewMode
  zoom: number
  showGrid: boolean
  showDimensions: boolean
  activeTool: Tool

  placedItems: PlacedItem[]
  waterSupplies: WaterSupply[]
  slopedCeilings: SlopedCeiling[]
  selectedItemId: string | null

  history: HistoryState[]
  historyIndex: number

  setShowRoomShapeModal: (show: boolean) => void
  setShowSuggestionsModal: (show: boolean) => void
  setShowWaterSupplyModal: (show: boolean) => void
  setShowSearchPanel: (show: boolean) => void
  setShowAreaPanel: (show: boolean) => void
  setShowViewModeOptions: (show: boolean) => void
  setRoom: (room: Room | null) => void
  setViewMode: (mode: ViewMode) => void
  setZoom: (zoom: number) => void
  setActiveTool: (tool: Tool) => void
  addPlacedItem: (item: PlacedItem) => void
  updatePlacedItem: (id: string, updates: Partial<PlacedItem>) => void
  removePlacedItem: (id: string) => void
  addWaterSupply: (supply: WaterSupply) => void
  addSlopedCeiling: (ceiling: SlopedCeiling) => void
  updateSlopedCeiling: (id: string, updates: Partial<SlopedCeiling>) => void
  removeSlopedCeiling: (id: string) => void
  setSelectedItemId: (id: string | null) => void
  updateRoomDimensions: (width: number, height: number) => void
  saveToHistory: () => void
  undo: () => void
  redo: () => void
  exportJSON: () => string
  exportPNG: (canvas: HTMLCanvasElement) => void
  loadFromJSON: (json: string) => void
  clearAllItems: () => void
}

export const usePlannerStore = create<PlannerState>()(
  (set, get) => ({
    showRoomShapeModal: true,
    showSuggestionsModal: false,
    showWaterSupplyModal: false,
    showSearchPanel: false,
    showAreaPanel: false,
    showViewModeOptions: false,
    room: null,
    viewMode: "2d",
    zoom: 1,
    showGrid: true,
    showDimensions: false,
    activeTool: "select",
    placedItems: [],
    waterSupplies: [],
    slopedCeilings: [],
    selectedItemId: null,
    history: [],
    historyIndex: -1,

    setShowRoomShapeModal: (show) => set({ showRoomShapeModal: show }),
    setShowSuggestionsModal: (show) => set({ showSuggestionsModal: show }),
    setShowWaterSupplyModal: (show) => set({ showWaterSupplyModal: show }),
    setShowSearchPanel: (show) => set({ showSearchPanel: show }),
    setShowAreaPanel: (show) => set({ showAreaPanel: show }),
    setShowViewModeOptions: (show) => set({ showViewModeOptions: show }),

    setRoom: (room) => {
      set({ room })
      get().saveToHistory()
    },

    setViewMode: (mode) => set({ viewMode: mode }),
    setZoom: (zoom) => set({ zoom }),
    setActiveTool: (tool) => set({ activeTool: tool }),

    addPlacedItem: (item) => {
      set((state) => ({ placedItems: [...state.placedItems, item] }))
      get().saveToHistory()
    },

    updatePlacedItem: (id, updates) => {
      set((state) => ({
        placedItems: state.placedItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      }))
    },

    removePlacedItem: (id) => {
      set((state) => ({
        placedItems: state.placedItems.filter((item) => item.id !== id),
      }))
      get().saveToHistory()
    },

    addWaterSupply: (supply) => {
      set((state) => ({ waterSupplies: [...state.waterSupplies, supply] }))
      get().saveToHistory()
    },

    addSlopedCeiling: (ceiling) => {
      set((state) => ({ slopedCeilings: [...state.slopedCeilings, ceiling] }))
      get().saveToHistory()
    },

    updateSlopedCeiling: (id, updates) => {
      set((state) => ({
        slopedCeilings: state.slopedCeilings.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      }))
      get().saveToHistory()
    },

    removeSlopedCeiling: (id) => {
      set((state) => ({
        slopedCeilings: state.slopedCeilings.filter((c) => c.id !== id),
      }))
      get().saveToHistory()
    },

    setSelectedItemId: (id) => set({ selectedItemId: id }),

    updateRoomDimensions: (width, height) => {
      set((state) => {
        if (!state.room) return {}

        const oldWidth = state.room.width
        const oldHeight = state.room.height

        // Avoid division by zero or invalid dimensions
        if (oldWidth <= 0 || oldHeight <= 0) {
          return {
            room: { ...state.room, width, height, area: (width * height) / 1_000_000 },
          }
        }

        const scaleX = width / oldWidth
        const scaleY = height / oldHeight

        const newPlacedItems = state.placedItems.map((item) => {
          const newX = item.x * scaleX
          const newY = item.y * scaleY

          if (item.type === "wall-segment") {
            // For walls, we also need to scale the length and adjust rotation
            // to match the new room aspect ratio
            const angleRad = (item.rotation * Math.PI) / 180
            const vx = item.width * Math.cos(angleRad)
            const vy = item.width * Math.sin(angleRad)

            const newVx = vx * scaleX
            const newVy = vy * scaleY

            const newLength = Math.sqrt(newVx * newVx + newVy * newVy)
            let newAngleRad = Math.atan2(newVy, newVx)
            let newRotation = (newAngleRad * 180) / Math.PI

            if (newRotation < 0) newRotation += 360

            return {
              ...item,
              x: newX,
              y: newY,
              width: newLength,
              rotation: newRotation,
            }
          }

          return {
            ...item,
            x: newX,
            y: newY,
          }
        })

        const newWaterSupplies = state.waterSupplies.map((supply) => ({
          ...supply,
          x: supply.x * scaleX,
          y: supply.y * scaleY,
        }))

        return {
          room: { ...state.room, width, height, area: (width * height) / 1_000_000 },
          placedItems: newPlacedItems,
          waterSupplies: newWaterSupplies,
        }
      })
      get().saveToHistory()
    },

    saveToHistory: () => {
      const state = get()
      const currentState: HistoryState = {
        room: state.room,
        placedItems: state.placedItems,
        waterSupplies: state.waterSupplies,
        slopedCeilings: state.slopedCeilings,
      }

      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(currentState)

      // Limit history to 20 items
      if (newHistory.length > 20) {
        newHistory.shift()
        set({ history: newHistory, historyIndex: newHistory.length - 1 })
      } else {
        set({ history: newHistory, historyIndex: newHistory.length - 1 })
      }
    },

    undo: () => {
      const state = get()
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1
        const prevState = state.history[newIndex]
        set({
          room: prevState.room,
          placedItems: prevState.placedItems,
          waterSupplies: prevState.waterSupplies,
          slopedCeilings: prevState.slopedCeilings,
          historyIndex: newIndex,
        })
      }
    },

    redo: () => {
      const state = get()
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1
        const nextState = state.history[newIndex]
        set({
          room: nextState.room,
          placedItems: nextState.placedItems,
          waterSupplies: nextState.waterSupplies,
          slopedCeilings: nextState.slopedCeilings,
          historyIndex: newIndex,
        })
      }
    },

    exportJSON: () => {
      const state = get()
      const exportData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        room: state.room,
        placedItems: state.placedItems,
        waterSupplies: state.waterSupplies,
        slopedCeilings: state.slopedCeilings,
      }
      return JSON.stringify(exportData, null, 2)
    },

    exportPNG: (canvas: HTMLCanvasElement) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `kitchen-plan-${Date.now()}.png`
          a.click()
          URL.revokeObjectURL(url)
        }
      })
    },

    loadFromJSON: (json: string) => {
      try {
        const data = JSON.parse(json)
        set({
          room: data.room,
          placedItems: data.placedItems || [],
          waterSupplies: data.waterSupplies || [],
          slopedCeilings: data.slopedCeilings || [],
        })
        get().saveToHistory()
      } catch (error) {
        console.error("Failed to load JSON:", error)
      }
    },

    clearAllItems: () => {
      console.log("[v0] Clearing all items and water supplies")
      set({ placedItems: [], waterSupplies: [], slopedCeilings: [] })
      get().saveToHistory()
    },
  }),
)
