"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { usePlannerStore, type PlacedItem } from "@/lib/planner-store"
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'
import { ViewControls } from "./view-controls"
import WallCursor from "./WallCursor"
import AddWallModal from "./add-wall-modal"
import AreaSeparationModal from "./area-separation-modal"
import SlopedCeilingModal from "./sloped-ceiling-modal"

type PolygonEdge = {
  start: { x: number; y: number }
  end: { x: number; y: number }
  index: number
}

type RoomInteraction =
  | "none"
  | "drag"
  | "resize-edge"
  | "resize-corner"
  | "resize-top"
  | "resize-bottom"
  | "resize-left"
  | "resize-right"
  | "resize-top-left"
  | "resize-top-right"
  | "resize-bottom-left"
  | "resize-bottom-right"

type ItemInteraction =
  | "none"
  | "drag"
  | "rotate"
  | "resize-n"
  | "resize-s"
  | "resize-e"
  | "resize-w"
  | "resize-ne"
  | "resize-nw"
  | "resize-se"
  | "resize-sw"


export function PlannerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modalCanvasRef = useRef<HTMLCanvasElement>(null)
  const [modalCanvasElement, setModalCanvasElement] = useState<HTMLCanvasElement | null>(null)

  const {
    room,
    zoom,
    showGrid,
    showDimensions,
    placedItems,
    addPlacedItem,
    updatePlacedItem,
    selectedItemId,
    setSelectedItemId,
    removePlacedItem,
    waterSupplies,
    slopedCeilings,
    addSlopedCeiling,
    saveToHistory,
    undo,
    redo,
    updateRoomDimensions,
    activeTool,
    setActiveTool,
  } = usePlannerStore()
  const { showRoomShapeModal, showSuggestionsModal } = usePlannerStore()
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [draggedItem, setDraggedItem] = useState<PlacedItem | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Wall drawing state
  const [isDrawingWall, setIsDrawingWall] = useState(false)
  const [wallStart, setWallStart] = useState<{ x: number; y: number } | null>(null)
  const [wallPreview, setWallPreview] = useState<{ x: number; y: number } | null>(null)
  const [tempWalls, setTempWalls] = useState<Array<{ start: { x: number; y: number }; end: { x: number; y: number } }>>([])
  const [forceRedraw, setForceRedraw] = useState(0)

  const [roomInteraction, setRoomInteraction] = useState<RoomInteraction>("none")
  const [roomOffset, setRoomOffset] = useState({ x: 0, y: 0 })
  const [initialRoomPosition, setInitialRoomPosition] = useState({ x: 0, y: 0 })
  const [initialRoomDimensions, setInitialRoomDimensions] = useState({ width: 0, height: 0 })
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })

  const [activeEdgeIndex, setActiveEdgeIndex] = useState<number>(-1)
  const [activeCornerIndex, setActiveCornerIndex] = useState<number>(-1)
  const [hoveredEdgeIndex, setHoveredEdgeIndex] = useState<number>(-1)
  const [hoveredCornerIndex, setHoveredCornerIndex] = useState<number>(-1)
  const [tempDimensions, setTempDimensions] = useState<{ width: number; height: number } | null>(null)
  const [clickedEdgeIndex, setClickedEdgeIndex] = useState<number>(-1) // Track clicked edge for persistent measurement
  const [hasMouseMoved, setHasMouseMoved] = useState<boolean>(false) // Track if mouse moved during interaction

  const [selectedWallId, setSelectedWallId] = useState<string | null>(null)
  const [floorBgImage, setFloorBgImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = "/floorplan2.jpeg"
    img.onload = () => {
      setFloorBgImage(img)
    }
  }, [])

  // Item Interaction State
  const [itemInteraction, setItemInteraction] = useState<ItemInteraction>("none")
  const [interactionStart, setInteractionStart] = useState<{
    mouse: { x: number; y: number }
    item: PlacedItem
  } | null>(null)

  // Helper: Rotate a point around a center
  const rotatePoint = (x: number, y: number, cx: number, cy: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const dx = x - cx
    const dy = y - cy
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    }
  }

  // Helper: Get handle positions in canvas coordinates
  const getHandlePositions = (item: PlacedItem, roomX: number, roomY: number, scale: number) => {
    const itemX = roomX + item.x * scale
    const itemY = roomY + item.y * scale
    const w = item.width * scale
    const h = item.height * scale
    const angle = item.rotation

    // Center of the item in canvas coords
    // Note: item.x/y is the top-left corner (unrotated), but rotation happens around center
    // Actually, in the render loop: ctx.translate(itemX + itemWidth / 2, itemY + itemHeight / 2)
    // So the visual center is:
    const cx = itemX + w / 2
    const cy = itemY + h / 2

    // Local offsets from center
    const hw = w / 2
    const hh = h / 2

    // Define handles in local unrotated space relative to center
    const handlesLocal = {
      nw: { x: -hw, y: -hh },
      n: { x: 0, y: -hh },
      ne: { x: hw, y: -hh },
      e: { x: hw, y: 0 },
      se: { x: hw, y: hh },
      s: { x: 0, y: hh },
      sw: { x: -hw, y: hh },
      w: { x: -hw, y: 0 },
      rotate: { x: 0, y: -hh - 30 }, // 30px above top
    }

    // Rotate all handles
    const handles: Record<string, { x: number; y: number }> = {}
    Object.entries(handlesLocal).forEach(([key, pos]) => {
      handles[key] = rotatePoint(cx + pos.x, cy + pos.y, cx, cy, angle)
    })

    return { handles, cx, cy }
  }

  // Helper: Snap value to grid
  const snapToGrid = (val: number, gridSize: number = 50) => {
    return Math.round(val / gridSize) * gridSize
  }

  const getRelatedEdges = (shape: string, edgeIndex: number): number[] => {
    if (shape === "l-shape") {
      // Edges: 0:Top, 1:CutV, 2:CutH, 3:Right, 4:Bottom, 5:Left
      // Cut is 1 and 2
      if (edgeIndex === 1 || edgeIndex === 2) return [1, 2]
    }
    if (shape === "custom") {
      // Edges: 0:Top, 1:RightUpper, 2:CutH, 3:CutV, 4:Bottom, 5:Left
      // Cut is 2 and 3
      if (edgeIndex === 2 || edgeIndex === 3) return [2, 3]
    }
    return [edgeIndex]
  }

  const getRoomPolygon = (
    roomX: number,
    roomY: number,
    roomWidthPx: number,
    roomHeightPx: number,
    shape: string,
  ): { x: number; y: number }[] => {
    switch (shape) {
      case "square":
      case "rectangle":
      case "open-l":
        return [
          { x: roomX, y: roomY },
          { x: roomX + roomWidthPx, y: roomY },
          { x: roomX + roomWidthPx, y: roomY + roomHeightPx },
          { x: roomX, y: roomY + roomHeightPx },
        ]
      case "l-shape":
        // Default ratios if params not set
        // 50/70 = 0.714 (Main Width ratio), 20/70 = 0.286 (Cut width ratio)
        // 20/70 = 0.286 (Cut height ratio)

        // Calculate scale to convert mm params to pixels
        // We use room.width/height to avoid division by zero if roomWidthPx is 0 (unlikely)
        const rWidth = room?.width ?? 0
        const rHeight = room?.height ?? 0

        const scaleX = rWidth > 0 ? roomWidthPx / rWidth : 1
        const scaleY = rHeight > 0 ? roomHeightPx / rHeight : 1

        const cutWidthMM = room?.params?.cutWidth ?? (rWidth * (20 / 70))
        const cutHeightMM = room?.params?.cutHeight ?? (rHeight * (20 / 70))

        const lCutWidth = cutWidthMM * scaleX
        const lCutHeight = cutHeightMM * scaleY

        return [
          { x: roomX, y: roomY },
          { x: roomX + (roomWidthPx - lCutWidth), y: roomY },
          { x: roomX + (roomWidthPx - lCutWidth), y: roomY + lCutHeight },
          { x: roomX + roomWidthPx, y: roomY + lCutHeight },
          { x: roomX + roomWidthPx, y: roomY + roomHeightPx },
          { x: roomX, y: roomY + roomHeightPx },
        ]
      case "u-shape":
        return [
          { x: roomX, y: roomY },
          { x: roomX + roomWidthPx * 0.85, y: roomY },
          { x: roomX + roomWidthPx, y: roomY + roomHeightPx * 0.15 },
          { x: roomX + roomWidthPx, y: roomY + roomHeightPx },
          { x: roomX, y: roomY + roomHeightPx },
        ]
      case "custom":
        // Matches M 15 15 L 105 15 L 105 50 L 70 50 L 70 105 L 15 105 Z
        // Widths: 15->105 = 90. 15->70 = 55. 55/90 = 0.611
        // Heights: 15->105 = 90. 15->50 = 35. 35/90 = 0.389
        return [
          { x: roomX, y: roomY },
          { x: roomX + roomWidthPx, y: roomY },
          { x: roomX + roomWidthPx, y: roomY + roomHeightPx * (35 / 90) },
          { x: roomX + roomWidthPx * (55 / 90), y: roomY + roomHeightPx * (35 / 90) },
          { x: roomX + roomWidthPx * (55 / 90), y: roomY + roomHeightPx },
          { x: roomX, y: roomY + roomHeightPx },
        ]
      default:
        return [
          { x: roomX, y: roomY },
          { x: roomX + roomWidthPx, y: roomY },
          { x: roomX + roomWidthPx, y: roomY + roomHeightPx },
          { x: roomX, y: roomY + roomHeightPx },
        ]
    }
  }

  // Helper to update room params
  const updateRoomParams = (newParams: { [key: string]: number }) => {
    if (!room) return
    const updatedRoom = { ...room, params: { ...room.params, ...newParams } }
    usePlannerStore.getState().setRoom(updatedRoom)
  }

  const getPolygonEdges = (vertices: { x: number; y: number }[]): PolygonEdge[] => {
    const edges: PolygonEdge[] = []
    for (let i = 0; i < vertices.length; i++) {
      const start = vertices[i]
      const end = vertices[(i + 1) % vertices.length]
      edges.push({ start, end, index: i })
    }
    return edges
  }

  const isNearEdge = (px: number, py: number, edge: PolygonEdge, threshold = 12): boolean => {
    const { start, end } = edge
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = Math.sqrt(dx * dx + dy * dy)

    if (length === 0) return false

    const t = Math.max(0, Math.min(1, ((px - start.x) * dx + (py - start.y) * dy) / (length * length)))
    const projX = start.x + t * dx
    const projY = start.y + t * dy
    const dist = Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)

    return dist < threshold
  }

  const isNearCorner = (px: number, py: number, corner: { x: number; y: number }, threshold = 12): boolean => {
    const dist = Math.sqrt((px - corner.x) ** 2 + (py - corner.y) ** 2)
    return dist < threshold
  }

  const getEdgeCursor = (edge: PolygonEdge): string => {
    const dx = edge.end.x - edge.start.x
    const dy = edge.end.y - edge.start.y
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)

    // Normalize angle to 0-180
    const normalizedAngle = (angle + 180) % 180

    if (normalizedAngle < 22.5 || normalizedAngle >= 157.5) {
      return "ew-resize" // Horizontal
    } else if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) {
      return "nesw-resize" // Diagonal /
    } else if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) {
      return "ns-resize" // Vertical
    } else {
      return "nwse-resize" // Diagonal \
    }
  }

  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement
        if (parent) {
          setCanvasSize({ width: parent.clientWidth, height: parent.clientHeight })
        }
      }
    }

    updateSize()

    // Prefer ResizeObserver on the canvas parent so layout changes (modals/panels)
    // trigger a canvas resize even when window.resize doesn't fire.
    let ro: ResizeObserver | null = null
    const parent = canvasRef.current?.parentElement
    if (parent && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateSize())
      ro.observe(parent)
    } else {
      window.addEventListener("resize", updateSize)
    }

    return () => {
      if (ro) ro.disconnect()
      else window.removeEventListener("resize", updateSize)
    }
  }, [])

  // Reset selected wall when tool changes
  useEffect(() => {
    if (activeTool !== "ceiling") {
      setSelectedWallId(null)
    }
  }, [activeTool])

  useEffect(() => {
    console.debug("[PlannerCanvas] render effect", { room })
    if (!canvasRef.current || !room) {
      if (!room) console.debug("[PlannerCanvas] no room to render")
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    // Paint a solid white background to hide any underlying patterned CSS
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (showGrid) {
      ctx.strokeStyle = "white"
      ctx.lineWidth = 1
      const gridSize = 50 * zoom
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    const scale = 0.15 * zoom
    const displayWidth = tempDimensions?.width || room.width
    const displayHeight = tempDimensions?.height || room.height
    const roomWidthPx = displayWidth * scale
    const roomHeightPx = displayHeight * scale
    const roomX = roomOffset.x || (canvas.width - roomWidthPx) / 2
    const roomY = roomOffset.y || (canvas.height - roomHeightPx) / 2

    const isResizing = roomInteraction === "resize-edge" || roomInteraction === "resize-corner"

    const vertices = getRoomPolygon(roomX, roomY, roomWidthPx, roomHeightPx, room.shape)
    const edges = getPolygonEdges(vertices)

    ctx.beginPath()
    ctx.moveTo(vertices[0].x, vertices[0].y)
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y)
    }
    ctx.closePath()

    // Draw thick gray wall (simulating walls outside the floor)
    ctx.save()
    ctx.strokeStyle = "#787575" // Thick wall color
    ctx.lineWidth = 20
    ctx.lineJoin = "round"
    ctx.stroke()
    ctx.restore()

    // Draw floor fill (covers inner half of the thick wall stroke)
    if (floorBgImage) {
      const pattern = ctx.createPattern(floorBgImage, "repeat")
      ctx.fillStyle = pattern || "rgba(242, 206, 167, 1)"
    } else {
      ctx.fillStyle = "rgba(242, 206, 167, 1)"
    }
    ctx.fill()

    // Draw exact border around shape in black
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw Sloped Ceilings (Always Visible)
    // Calculate offset lines
    const offsetLines = vertices.map((p1, i) => {
      const p2 = vertices[(i + 1) % vertices.length]
      const wallId = i.toString()
      const slope = slopedCeilings.find(s => s.wallId === wallId)

      let offset = 0
      if (slope) {
        offset = slope.b * scale
      } else if (activeTool === "ceiling" && wallId === selectedWallId) {
        offset = 1400 * scale // Default preview only when tool is active
      }

      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const len = Math.sqrt(dx * dx + dy * dy)
      const nx = -dy / len
      const ny = dx / len

      return {
        p1: { x: p1.x + nx * offset, y: p1.y + ny * offset },
        p2: { x: p2.x + nx * offset, y: p2.y + ny * offset }
      }
    })

    // Calculate inner vertices (intersections)
    const innerVertices = offsetLines.map((l1, i) => {
      const l2 = offsetLines[(i + 1) % offsetLines.length]

      const x1 = l1.p1.x, y1 = l1.p1.y, x2 = l1.p2.x, y2 = l1.p2.y
      const x3 = l2.p1.x, y3 = l2.p1.y, x4 = l2.p2.x, y4 = l2.p2.y

      const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
      if (Math.abs(denom) < 0.001) return l1.p2 // Parallel/Collinear fallback

      const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom
      return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1)
      }
    })

    // Draw Inner Polygon (Flat Ceiling)
    // Only draw if there is at least one slope or preview
    const hasAnySlope = slopedCeilings.length > 0 || (activeTool === "ceiling" && selectedWallId)

    if (hasAnySlope) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.beginPath()
      if (innerVertices.length > 0) {
        ctx.moveTo(innerVertices[0].x, innerVertices[0].y)
        for (let i = 1; i < innerVertices.length; i++) {
          ctx.lineTo(innerVertices[i].x, innerVertices[i].y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = "#888"
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw Slope Areas (Blue Visualization)
      vertices.forEach((p1, i) => {
        const wallId = i.toString()
        const slope = slopedCeilings.find(s => s.wallId === wallId)
        const isSelected = activeTool === "ceiling" && wallId === selectedWallId

        if (slope || isSelected) {
          const p2 = vertices[(i + 1) % vertices.length]
          const innerP2 = innerVertices[i]
          const innerP1 = innerVertices[(i - 1 + vertices.length) % vertices.length]

          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.lineTo(innerP2.x, innerP2.y)
          ctx.lineTo(innerP1.x, innerP1.y)
          ctx.closePath()

          ctx.fillStyle = "rgba(59, 130, 246, 0.2)" // Blue transparent
          ctx.fill()
          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      // Draw Slope Lines (Diagonals)
      ctx.strokeStyle = "#888"
      ctx.lineWidth = 1
      for (let i = 0; i < vertices.length; i++) {
        ctx.beginPath()
        ctx.moveTo(vertices[i].x, vertices[i].y)
        ctx.lineTo(innerVertices[i].x, innerVertices[i].y)
        ctx.stroke()
      }
    }

    edges.forEach((edge, index) => {
      // Highlight edge if it's being resized OR if it was clicked
      if ((index === activeEdgeIndex && isResizing) || index === clickedEdgeIndex) {
        ctx.strokeStyle = "#000000" // Black outline as shown in the reference image
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(edge.start.x, edge.start.y)
        ctx.lineTo(edge.end.x, edge.end.y)
        ctx.stroke()
      }
    })

    if (room.shape === "open-l") {
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 2
      ctx.setLineDash([10, 5])
      ctx.beginPath()
      ctx.moveTo(roomX, roomY + roomHeightPx * 0.5)
      ctx.lineTo(roomX + roomWidthPx, roomY + roomHeightPx * 0.5)
      ctx.stroke()
      ctx.setLineDash([])
    } else if (room.shape === "rectangle") {
      // Matches preview: rect + L-shaped dashed line
      // Horizontal: (15,45) to (45,45) -> (x, y + h*3/7) to (x + w*3/7, y + h*3/7)
      // Vertical: (45,15) to (45,45) -> (x + w*3/7, y) to (x + w*3/7, y + h*3/7)
      const ratio = 30 / 70 // ~0.428

      ctx.strokeStyle = "#666"
      ctx.lineWidth = 2
      ctx.setLineDash([10, 5])

      // Horizontal dashed line
      ctx.beginPath()
      ctx.moveTo(roomX, roomY + roomHeightPx * (45 / 70))
      ctx.lineTo(roomX + roomWidthPx * (30 / 70), roomY + roomHeightPx * (45 / 70))
      ctx.stroke()

      // Vertical dashed line
      ctx.beginPath()
      ctx.moveTo(roomX + roomWidthPx * (30 / 70), roomY)
      ctx.lineTo(roomX + roomWidthPx * (30 / 70), roomY + roomHeightPx * (45 / 70))
      ctx.stroke()

      ctx.setLineDash([])
    } else if (room.shape === "custom") {
      // Matches preview: L-shaped polygon + horizontal dashed line
      // Dashed line: (15, 50) to (105, 50)
      // In polygon coords: y=50 corresponds to the inner corner y (35/90 = 0.389)
      // So line goes from x=0 to x=width at y=height * (35/90)

      ctx.strokeStyle = "#666"
      ctx.lineWidth = 2
      ctx.setLineDash([10, 5])
      ctx.beginPath()
      ctx.moveTo(roomX, roomY + roomHeightPx * (35 / 90))
      ctx.lineTo(roomX + roomWidthPx, roomY + roomHeightPx * (35 / 90))
      ctx.stroke()
      ctx.setLineDash([])
    }

    waterSupplies.forEach((supply) => {
      const supplyX = roomX + supply.x * scale
      const supplyY = roomY + supply.y * scale

      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(supplyX, supplyY, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = "#1e40af"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = "#fff"
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("💧", supplyX, supplyY)
    })

    placedItems.forEach((item) => {
      const itemX = roomX + item.x * scale
      const itemY = roomY + item.y * scale
      const itemWidth = item.width * scale
      const itemHeight = item.height * scale

      ctx.save()

      // For wall segments, use start-point anchoring; for other items, use center
      if (item.type === "wall-segment" || item.type === "separation-line") {
        ctx.translate(itemX, itemY)
        ctx.rotate((item.rotation * Math.PI) / 180)

        if (item.type === "separation-line") {
          // Draw separation line (thin gray)
          ctx.fillStyle = "#9ca3af" // gray-400
          ctx.strokeStyle = item.id === selectedItemId ? "#2563eb" : "#9ca3af"
          ctx.lineWidth = 1
          // Draw a thin line
          ctx.fillRect(0, -1, itemWidth, 2)
        } else {
          // Draw wall as a thick line from origin
          ctx.fillStyle = item.id === selectedItemId ? "#3b82f6" : "#9ca3af"
          ctx.strokeStyle = item.id === selectedItemId ? "#2563eb" : "#6b7280"
          ctx.lineWidth = 3
          ctx.fillRect(0, -itemHeight / 2, itemWidth, itemHeight)
          ctx.strokeRect(0, -itemHeight / 2, itemWidth, itemHeight)
        }

        // Draw measurement label for wall segment
        if (item.type !== "separation-line") {
          const text = `${Math.round(item.width)} mm`
          ctx.font = "12px sans-serif"
          const metrics = ctx.measureText(text)
          const padding = 4

          // Ensure text is always upright
          ctx.save()
          // Move to center of wall
          ctx.translate(itemWidth / 2, 0)
          // If rotation puts text upside down, flip it
          if (item.rotation > 90 && item.rotation <= 270) {
            ctx.rotate(Math.PI)
          }

          ctx.fillStyle = "#fff"
          ctx.fillRect(-metrics.width / 2 - padding, -10, metrics.width + padding * 2, 20)

          ctx.fillStyle = "#000"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(text, 0, 0)
          ctx.restore()
        }

      } else {
        // Regular items use center anchoring
        ctx.translate(itemX + itemWidth / 2, itemY + itemHeight / 2)
        ctx.rotate((item.rotation * Math.PI) / 180)

        const isStructure = ["Box object", "Column square", "Column round"].includes(item.type)
        const isSelected = item.id === selectedItemId

        if (isStructure) {
          ctx.fillStyle = "#FFFFFF"
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#000000"
          ctx.lineWidth = 2
        } else {
          ctx.fillStyle = isSelected ? "#3b82f6" : "#94a3b8"
          ctx.strokeStyle = isSelected ? "#2563eb" : "#64748b"
          ctx.lineWidth = 2
        }

        if (item.type === "Column round") {
          ctx.beginPath()
          ctx.arc(0, 0, itemWidth / 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        } else if (["Double electric socket", "Double light switch", "Single electric socket", "Single light switch"].includes(item.type)) {
          // Electricity items rendering
          // Base black/dark gray rectangle
          ctx.fillStyle = "#222222"
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#222222"
          ctx.lineWidth = 1
          ctx.fillRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)

          // Minor differences / Details
          ctx.fillStyle = "#888888" // Gray for details

          if (item.type.includes("Double")) {
            if (item.type.includes("socket")) {
              // 1st object style: Double Socket - Two vertical lines/pins
              ctx.fillRect(-itemWidth / 4 - 2, -itemHeight / 2, 4, itemHeight)
              ctx.fillRect(itemWidth / 4 - 2, -itemHeight / 2, 4, itemHeight)
            } else {
              // 2nd object style: Double Switch - Two small button squares
              ctx.fillRect(-itemWidth / 4 - 4, -4, 8, 8)
              ctx.fillRect(itemWidth / 4 - 4, -4, 8, 8)
            }
          } else {
            if (item.type.includes("socket")) {
              // 3rd object style: Single Socket - One vertical line
              ctx.fillRect(-2, -itemHeight / 2, 4, itemHeight)
            } else {
              // 4th object style: Single Switch - One small button square
              ctx.fillRect(-4, -4, 8, 8)
            }
          }
        } else if (item.type === "Radiator") {
          // Radiator rendering: Dark gray thin line/rectangle
          ctx.fillStyle = "#555555"
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#333333"
          ctx.lineWidth = 1
          ctx.fillRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
        } else if (item.type === "Air vent") {
          // Air vent rendering: Box with grille lines
          ctx.fillStyle = "#FFFFFF"
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#000000"
          ctx.lineWidth = 1
          ctx.fillRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)

          // Draw internal grille lines
          ctx.beginPath()
          const lineCount = 3
          const step = itemHeight / (lineCount + 1)
          for (let i = 1; i <= lineCount; i++) {
            const y = -itemHeight / 2 + step * i
            ctx.moveTo(-itemWidth / 2 + 2, y)
            ctx.lineTo(itemWidth / 2 - 2, y)
          }
          ctx.strokeStyle = "#888888"
          ctx.stroke()
        } else if (item.type === "floor drain") {
          // Floor drain: Gray box with circle/X pattern
          ctx.fillStyle = "#BBBBBB"
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#555555"
          ctx.lineWidth = 1
          ctx.fillRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)

          // Drain pattern
          ctx.beginPath()
          ctx.arc(0, 0, itemWidth / 3, 0, Math.PI * 2)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(-itemWidth / 3, -itemWidth / 3)
          ctx.lineTo(itemWidth / 3, itemWidth / 3)
          ctx.moveTo(itemWidth / 3, -itemWidth / 3)
          ctx.lineTo(-itemWidth / 3, itemWidth / 3)
          ctx.stroke()
        } else if (item.type.toLowerCase().includes("gas pipe")) {
          // Gas pipe: Orange/Gold
          ctx.fillStyle = "#E6B800"
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#B38F00"
          ctx.lineWidth = 1
          ctx.fillRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
        } else if (item.type.toLowerCase().includes("water pipe")) {
          // Water pipe: Copper/Brown "Pi" shape or just distintive pipe
          // Based on image "4th object", it looks like a bracket or U-shape
          ctx.fillStyle = "#CD7F32" // Copper
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#8B4513"
          ctx.lineWidth = 1

          // Draw a "Pi" shape or double-leg shape
          // Horizontal top bar
          const barHeight = itemHeight * 0.4
          ctx.fillRect(-itemWidth / 2, -itemHeight / 2, itemWidth, barHeight)
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, barHeight)

          // Two vertical legs
          const legWidth = itemWidth * 0.15
          ctx.fillRect(-itemWidth / 4 - legWidth / 2, -itemHeight / 2 + barHeight, legWidth, itemHeight - barHeight)
          ctx.strokeRect(-itemWidth / 4 - legWidth / 2, -itemHeight / 2 + barHeight, legWidth, itemHeight - barHeight)

          ctx.fillRect(itemWidth / 4 - legWidth / 2, -itemHeight / 2 + barHeight, legWidth, itemHeight - barHeight)
          ctx.strokeRect(itemWidth / 4 - legWidth / 2, -itemHeight / 2 + barHeight, legWidth, itemHeight - barHeight)

        } else if (item.type.toLowerCase().includes("pipe")) {
          // Generic pipe (horizontal/vertical pipe): Gray
          ctx.fillStyle = "#999999"
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#666666"
          ctx.lineWidth = 1
          ctx.fillRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
        } else if (item.type === "Double window") {
          // Double Window: White box with two swing arcs (90 degree inward)
          ctx.fillStyle = "#FFFFFF"
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#000000"
          ctx.lineWidth = 2
          ctx.fillRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)

          // Arcs
          ctx.beginPath()
          ctx.strokeStyle = "#000000"
          ctx.lineWidth = 1

          // Left Pane Arc (Center at Top-Left, swinging down-right)
          // Radius is half width
          const r = itemWidth / 2
          ctx.arc(-itemWidth / 2, -itemHeight / 2, r, 0, Math.PI / 2)

          // Right Pane Arc (Center at Top-Right, swinging down-left)
          ctx.moveTo(itemWidth / 2, -itemHeight / 2 + r) // Move to end of arc to avoid line
          ctx.arc(itemWidth / 2, -itemHeight / 2, r, Math.PI / 2, Math.PI)
          ctx.stroke()

          // Draw "open" lines (panes @ 90 degrees)
          ctx.beginPath()
          ctx.moveTo(-itemWidth / 2, -itemHeight / 2)
          ctx.lineTo(-itemWidth / 2, -itemHeight / 2 + r)

          ctx.moveTo(itemWidth / 2, -itemHeight / 2)
          ctx.lineTo(itemWidth / 2, -itemHeight / 2 + r)
          ctx.stroke()

        } else if (item.type === "Single window") {
          // Single Window
          ctx.fillStyle = "#FFFFFF"
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#000000"
          ctx.lineWidth = 2
          ctx.fillRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)

          // Arc
          ctx.beginPath()
          ctx.strokeStyle = "#000000"
          ctx.lineWidth = 1
          const r = itemWidth
          ctx.arc(-itemWidth / 2, -itemHeight / 2, r, 0, Math.PI / 2)
          ctx.stroke()

          // Pane line
          ctx.lineTo(-itemWidth / 2, itemHeight / 2)
          ctx.stroke()

        } else if (item.type === "Non opening window") {
          // Non opening window: Simple box with center glass line + sill
          ctx.fillStyle = "#FFFFFF"
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#000000"
          ctx.lineWidth = 1
          ctx.fillRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)

          // Center glass line
          ctx.beginPath()
          ctx.strokeStyle = "#000000"
          ctx.moveTo(-itemWidth / 2, 0)
          ctx.lineTo(itemWidth / 2, 0)
          ctx.stroke()

          // Sill line (offset slightly)
          ctx.beginPath()
          ctx.strokeStyle = "#888888"
          ctx.moveTo(-itemWidth / 2, itemHeight / 2 + 5)
          ctx.lineTo(itemWidth / 2, itemHeight / 2 + 5)
          ctx.stroke()
        } else if (["Double Interior door", "Patio Door"].includes(item.type)) {
          // Double Door Rendering
          ctx.fillStyle = "#FFFFFF"
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#000000"
          ctx.lineWidth = 1
          // Draw minimal frame/threshold
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)

          // 2 Leaves swinging (assuming swing "out" or "in" - let's do "up" relative to item)
          const r = itemWidth / 2
          ctx.beginPath()
          ctx.strokeStyle = "#000000"

          // Left Leaf Arc (hinge at left)
          ctx.moveTo(-itemWidth / 2, -itemHeight / 2)
          ctx.arc(-itemWidth / 2, -itemHeight / 2, r, 0, Math.PI / 2) // 0 to 90

          // Right Leaf Arc (hinge at right)
          // For right hinge, 180 to 90? Or Math.PI to Math.PI/2
          ctx.moveTo(itemWidth / 2, -itemHeight / 2 + r)
          ctx.arc(itemWidth / 2, -itemHeight / 2, r, Math.PI / 2, Math.PI)

          ctx.stroke()

          // Leaf Lines
          ctx.beginPath()
          ctx.moveTo(-itemWidth / 2, -itemHeight / 2)
          ctx.lineTo(-itemWidth / 2, -itemHeight / 2 + r) // open 90deg

          ctx.moveTo(itemWidth / 2, -itemHeight / 2)
          ctx.lineTo(itemWidth / 2, -itemHeight / 2 + r) // open 90deg
          ctx.stroke()

        } else if (item.type === "Simple door") {
          // Simple Door Rendering
          ctx.fillStyle = "#FFFFFF"
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#000000"
          ctx.lineWidth = 1
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)

          // 1 Leaf swinging
          const r = itemWidth
          ctx.beginPath()
          ctx.strokeStyle = "#000000"

          // Left Hinge default
          ctx.moveTo(-itemWidth / 2, -itemHeight / 2)
          ctx.arc(-itemWidth / 2, -itemHeight / 2, r, 0, Math.PI / 2)
          ctx.stroke()

          // Leaf Line
          ctx.beginPath()
          ctx.moveTo(-itemWidth / 2, -itemHeight / 2)
          ctx.lineTo(-itemWidth / 2, -itemHeight / 2 + r)
          ctx.stroke()

        } else if (item.type === "Wall Opening") {
          // Wall Opening: Rectangle with two internal lines (jambs)
          // Look like a long rect with small squares at ends
          ctx.fillStyle = "#F5F5F5" // Very light gray/white
          ctx.strokeStyle = isSelected ? "#3b82f6" : "#000000"
          ctx.lineWidth = 1

          // Main box
          ctx.fillRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)

          // Internal vertical lines
          // The image shows square-ish end sections. Let's use itemHeight as the width of these sections
          // but ensure we don't overlap if width is very small
          const endSectionWidth = Math.min(itemHeight, itemWidth / 3)

          ctx.beginPath()
          // Left internal line
          ctx.moveTo(-itemWidth / 2 + endSectionWidth, -itemHeight / 2)
          ctx.lineTo(-itemWidth / 2 + endSectionWidth, itemHeight / 2)

          // Right internal line
          ctx.moveTo(itemWidth / 2 - endSectionWidth, -itemHeight / 2)
          ctx.lineTo(itemWidth / 2 - endSectionWidth, itemHeight / 2)

          ctx.stroke()

        } else {
          // Box object, Column square, etc.
          ctx.fillRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
          ctx.strokeRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight)
        }

        // Hide label for specific fittings as well
        const fittings = ["floor drain", "gas pipe", "water pipe", "pipe"]
        const shouldHideLabel = fittings.some(f => item.type.toLowerCase().includes(f)) ||
          ["Double electric socket", "Double light switch", "Single electric socket", "Single light switch", "Radiator", "Air vent", "Double window", "Single window", "Roof Window", "Non opening window", "Double Interior door", "Patio Door", "Simple door", "Wall Opening"].includes(item.type)

        if (!isStructure && !shouldHideLabel) {
          ctx.fillStyle = "#fff"
          ctx.font = "10px sans-serif"
          ctx.textAlign = "center"

          ctx.textBaseline = "middle"
          ctx.fillText(item.type, 0, 0)
        }
      }

      ctx.restore()
    })

    // Draw Selection Overlay (Bounding Box + Handles)
    if (selectedItemId) {
      const item = placedItems.find((i) => i.id === selectedItemId)
      if (item && item.type !== "wall-segment" && item.type !== "separation-line") {
        const { handles, cx, cy } = getHandlePositions(item, roomX, roomY, scale)
        const w = item.width * scale
        const h = item.height * scale

        ctx.save()

        // Draw Bounding Box
        ctx.translate(cx, cy)
        ctx.rotate((item.rotation * Math.PI) / 180)
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 1.5
        ctx.strokeRect(-w / 2, -h / 2, w, h)

        // Draw Rotation Line
        ctx.beginPath()
        ctx.moveTo(0, -h / 2)
        ctx.lineTo(0, -h / 2 - 30)
        ctx.strokeStyle = "#3b82f6"
        ctx.stroke()

        ctx.restore()

        // Draw Handles
        const handleSize = 8
        const drawHandle = (x: number, y: number, isRotate = false) => {
          ctx.fillStyle = "#ffffff"
          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 1.5

          if (isRotate) {
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
          } else {
            ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize)
            ctx.strokeRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize)
          }
        }

        Object.entries(handles).forEach(([key, pos]) => {
          drawHandle(pos.x, pos.y, key === "rotate")
        })

        // Draw Live Dimensions
        if (itemInteraction.startsWith("resize")) {
          const text = `${Math.round(item.width)} × ${Math.round(item.height)} mm`
          ctx.font = "12px sans-serif"
          const metrics = ctx.measureText(text)
          const padding = 6

          ctx.fillStyle = "#1e293b"
          ctx.fillRect(cx - metrics.width / 2 - padding, cy + h / 2 + 20, metrics.width + padding * 2, 24)

          ctx.fillStyle = "#ffffff"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(text, cx, cy + h / 2 + 32)
        }
      }
    }

    // Draw temporary walls (the ones user is drawing before confirming)
    if (activeTool === "wall" || activeTool === "separation") {
      const isSeparation = activeTool === "separation"
      ctx.strokeStyle = isSeparation ? "#9ca3af" : "#9ca3af"
      ctx.lineWidth = isSeparation ? 2 : 8
      ctx.lineCap = "round"
      tempWalls.forEach((seg) => {
        const sx = roomX + seg.start.x * scale
        const sy = roomY + seg.start.y * scale
        const ex = roomX + seg.end.x * scale
        const ey = roomY + seg.end.y * scale

        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(ex, ey)
        ctx.stroke()

        // Draw wall end points
        ctx.fillStyle = "#9ca3af"
        ctx.beginPath()
        ctx.arc(sx, sy, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(ex, ey, 5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw wall start point if currently drawing
      if (wallStart && isDrawingWall) {
        const sx = roomX + wallStart.x * scale
        const sy = roomY + wallStart.y * scale
        ctx.fillStyle = isSeparation ? "#9ca3af" : "#60a5fa"
        ctx.beginPath()
        ctx.arc(sx, sy, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = "#fff"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // preview segment under cursor
      if (wallStart && wallPreview) {
        const sx = roomX + wallStart.x * scale
        const sy = roomY + wallStart.y * scale
        const ex = roomX + wallPreview.x * scale
        const ey = roomY + wallPreview.y * scale

        ctx.save()
        ctx.strokeStyle = isSeparation ? "#9ca3af" : "#60a5fa"
        ctx.lineWidth = isSeparation ? 2 : 8
        ctx.lineCap = "butt"
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(ex, ey)
        ctx.stroke()
        ctx.restore()

        // Draw preview end point
        ctx.fillStyle = isSeparation ? "#9ca3af" : "#60a5fa"
        ctx.beginPath()
        ctx.arc(ex, ey, 4, 0, Math.PI * 2)
        ctx.fill()

        // Draw measurements
        if (!isSeparation) {
          const dx = ex - sx
          const dy = ey - sy
          const lengthPx = Math.sqrt(dx * dx + dy * dy)
          const lengthMm = Math.sqrt(Math.pow(wallPreview.x - wallStart.x, 2) + Math.pow(wallPreview.y - wallStart.y, 2))

          if (lengthPx > 20) {
            const angle = Math.atan2(dy, dx)
            const offset = 30

            ctx.save()
            ctx.translate(sx, sy)
            ctx.rotate(angle)

            ctx.strokeStyle = "#333"
            ctx.lineWidth = 1
            ctx.fillStyle = "#333"
            ctx.font = "12px sans-serif"
            ctx.textAlign = "center"

            // Top measurement
            ctx.textBaseline = "bottom"
            ctx.beginPath()
            ctx.moveTo(0, -offset)
            ctx.lineTo(lengthPx, -offset)
            ctx.moveTo(0, -offset + 5)
            ctx.lineTo(0, -offset - 5)
            ctx.moveTo(lengthPx, -offset + 5)
            ctx.lineTo(lengthPx, -offset - 5)
            ctx.stroke()

            const text = `${Math.round(lengthMm)} mm`
            const textWidth = ctx.measureText(text).width
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
            ctx.fillRect(lengthPx / 2 - textWidth / 2 - 2, -offset - 14, textWidth + 4, 14)
            ctx.fillStyle = "#333"
            ctx.fillText(text, lengthPx / 2, -offset - 2)

            // Bottom measurement
            ctx.textBaseline = "top"
            ctx.beginPath()
            ctx.moveTo(0, offset)
            ctx.lineTo(lengthPx, offset)
            ctx.moveTo(0, offset - 5)
            ctx.lineTo(0, offset + 5)
            ctx.moveTo(lengthPx, offset - 5)
            ctx.lineTo(lengthPx, offset + 5)
            ctx.stroke()

            ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
            ctx.fillRect(lengthPx / 2 - textWidth / 2 - 2, offset + 2, textWidth + 4, 14)
            ctx.fillStyle = "#333"
            ctx.fillText(text, lengthPx / 2, offset + 2)

            ctx.restore()
          }
        }
      }
    }

    // Calculate and draw sub-areas if walls exist
    const walls = placedItems.filter(i => i.type === 'wall-segment' || i.type === 'separation-line');
    let subAreasDrawn = false;

    if (walls.length > 0) {
      // Grid resolution in mm (larger = faster but less accurate)
      const resolution = 25; // Increased resolution (smaller cells) for better accuracy
      const cols = Math.ceil(room.width / resolution);
      const rows = Math.ceil(room.height / resolution);
      const grid = new Int8Array(cols * rows).fill(0); // 0: unknown, 1: wall/outside, 2+: area id

      // Initialize grid: mark outside as 1
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = x * resolution + resolution / 2;
          const py = y * resolution + resolution / 2;
          // We need to check if this point is inside the room polygon
          // We can reuse isPointInRoom but we need to adapt it to work with raw coordinates
          // Or simpler: just check bounding box for now, but for L-shape we need polygon check.
          // Let's use the getRoomPolygon helper which returns vertices
          const vertices = getRoomPolygon(0, 0, room.width, room.height, room.shape);

          // Point in polygon check
          let inside = false;
          for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x, yi = vertices[i].y;
            const xj = vertices[j].x, yj = vertices[j].y;
            const intersect = ((yi > py) !== (yj > py)) &&
              (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
          }

          if (!inside) {
            grid[y * cols + x] = 1; // Outside
          }
        }
      }

      // Mark walls
      walls.forEach(wall => {
        const x0 = wall.x / resolution;
        const y0 = wall.y / resolution;
        const angle = wall.rotation * Math.PI / 180;
        const len = wall.width / resolution;
        const x1 = x0 + Math.cos(angle) * len;
        const y1 = y0 + Math.sin(angle) * len;

        const steps = Math.ceil(len * 2); // Ensure no gaps
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const cx = Math.floor(x0 + (x1 - x0) * t);
          const cy = Math.floor(y0 + (y1 - y0) * t);
          if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
            grid[cy * cols + cx] = 1; // Wall
          }
        }
      });

      // Flood fill
      const areas: { id: number, count: number, sumX: number, sumY: number }[] = [];
      let currentId = 2;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[y * cols + x] === 0) {
            const stack = [[x, y]];
            grid[y * cols + x] = currentId;
            let count = 0;
            let sumX = 0;
            let sumY = 0;

            while (stack.length > 0) {
              const [cx, cy] = stack.pop()!;
              count++;
              sumX += cx;
              sumY += cy;

              const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
              for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny * cols + nx] === 0) {
                  grid[ny * cols + nx] = currentId;
                  stack.push([nx, ny]);
                }
              }
            }

            // Filter small noise areas (< 0.01 m2) - Lowered threshold to catch smaller areas
            if (count * resolution * resolution / 1000000 > 0.01) {
              areas.push({ id: currentId, count, sumX, sumY });
              currentId++;
            }
          }
        }
      }

      // Draw area labels
      if (areas.length > 0) {
        subAreasDrawn = true;
        areas.forEach((area, index) => {
          const areaM2 = (area.count * resolution * resolution) / 1000000;
          const centerX = (area.sumX / area.count) * resolution;
          const centerY = (area.sumY / area.count) * resolution;

          const labelX = roomX + centerX * scale;
          const labelY = roomY + centerY * scale;

          ctx.fillStyle = "#000";
          ctx.font = "14px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`Area ${index + 1}`, labelX, labelY - 10);
          ctx.fillText(`${areaM2.toFixed(1)} m²`, labelX, labelY + 10);
        });
      }
    }

    if (!subAreasDrawn) {
      ctx.fillStyle = "#000"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(room.name, roomX + roomWidthPx / 2, roomY + roomHeightPx / 2 - 10)
      ctx.fillText(`${room.area.toFixed(1)} m²`, roomX + roomWidthPx / 2, roomY + roomHeightPx / 2 + 10)
    }

    // Show measurements:
    // 1. Idle: Show all
    // 2. Resizing: Show only active/related/clicked
    // 3. Dragging Room: Show none
    if (roomInteraction !== 'drag') {
      const measurementOffset = 35 // Reduced offset to be closer to shape
      const lineExtension = 15

      ctx.strokeStyle = "#666"
      ctx.fillStyle = "#000"
      ctx.lineWidth = 1
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      edges.forEach((edge, index) => {
        const midX = (edge.start.x + edge.end.x) / 2
        const midY = (edge.start.y + edge.end.y) / 2
        const dx = edge.end.x - edge.start.x
        const dy = edge.end.y - edge.start.y
        const length = Math.sqrt(dx * dx + dy * dy)
        const lengthMM = Math.round(length / scale)

        // Calculate perpendicular direction (outwards for clockwise polygon)
        const perpX = dy / length
        const perpY = -dx / length

        // Filter: Only show measurements on UP (perpY < 0) and LEFT (perpX < 0) sides
        // unless the edge is actively being interacted with
        const isFacingUpOrLeft = perpY < -0.001 || perpX < -0.001

        // Show measurement if edge is active, clicked, or showDimensions is on
        // Also check for related edges (e.g. both sides of a corner/cut)
        const relatedEdges = clickedEdgeIndex >= 0 ? getRelatedEdges(room.shape, clickedEdgeIndex) : []
        const isRelated = relatedEdges.includes(index)

        const isIdle = roomInteraction === 'none';
        const isTargeted = index === activeEdgeIndex || index === clickedEdgeIndex || isRelated;

        // Apply direction filter only if not specifically targeted
        if (!isFacingUpOrLeft && !isTargeted) return

        if (isIdle || (isResizing && isTargeted) || showDimensions) {
          // Draw measurement line parallel to edge
          const offsetX = perpX * measurementOffset
          const offsetY = perpY * measurementOffset

          ctx.beginPath()
          ctx.moveTo(edge.start.x + offsetX, edge.start.y + offsetY)
          ctx.lineTo(edge.end.x + offsetX, edge.end.y + offsetY)
          ctx.strokeStyle = "#000" // Black lines as shown in reference image
          ctx.stroke()

          // Draw end caps (tick marks)
          ctx.beginPath()
          ctx.moveTo(
            edge.start.x + offsetX - (perpY * lineExtension) / 2,
            edge.start.y + offsetY + (perpX * lineExtension) / 2,
          )
          ctx.lineTo(
            edge.start.x + offsetX + (perpY * lineExtension) / 2,
            edge.start.y + offsetY - (perpX * lineExtension) / 2,
          )
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(
            edge.end.x + offsetX - (perpY * lineExtension) / 2,
            edge.end.y + offsetY + (perpX * lineExtension) / 2,
          )
          ctx.lineTo(
            edge.end.x + offsetX + (perpY * lineExtension) / 2,
            edge.end.y + offsetY - (perpX * lineExtension) / 2,
          )
          ctx.stroke()

          // Extension lines removed to match requested style


          // Draw text
          const text = `${lengthMM} mm`
          const textMetrics = ctx.measureText(text)
          const padding = 6

          ctx.save()
          ctx.translate(midX + offsetX, midY + offsetY)
          const angle = Math.atan2(dy, dx)

          // Keep text upright
          if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
            ctx.rotate(angle + Math.PI)
          } else {
            ctx.rotate(angle)
          }

          // White box with border
          ctx.fillStyle = "#fff"
          ctx.strokeStyle = "#000" // Black border for clicked edges
          ctx.lineWidth = 1
          ctx.fillRect(-textMetrics.width / 2 - padding, -12, textMetrics.width + padding * 2, 24)
          ctx.strokeRect(-textMetrics.width / 2 - padding, -12, textMetrics.width + padding * 2, 24)

          ctx.fillStyle = index === clickedEdgeIndex ? "#000" : (index === activeEdgeIndex ? "#0051BA" : "#111")
          ctx.font = (index === activeEdgeIndex || index === clickedEdgeIndex) ? "bold 12px sans-serif" : "12px sans-serif"
          ctx.fillText(text, 0, 0)

          ctx.restore()
        }
      })
    }
  }, [
    room,
    zoom,
    showGrid,
    showDimensions,
    canvasSize,
    placedItems,
    selectedItemId,
    waterSupplies,
    roomOffset,
    roomInteraction,
    activeEdgeIndex,
    activeCornerIndex,
    hoveredEdgeIndex,
    hoveredCornerIndex,
    tempDimensions,
    clickedEdgeIndex,
    slopedCeilings,
    activeTool,
    selectedWallId,
    tempWalls,
    wallStart,
    wallPreview,
    isDrawingWall,
    floorBgImage,
  ])

  // Draw a simplified preview into the modal canvas (if present)
  useEffect(() => {
    if (activeTool !== "wall" && activeTool !== "separation" && activeTool !== "ceiling") return // Only draw when wall, separation or ceiling tool is active

    const modal = modalCanvasElement || modalCanvasRef.current
    if (!modal || !room) return

    // Draw immediately for smooth performance
    const ctx = modal.getContext("2d")
    if (!ctx) return

    const w = modal.clientWidth || modal.offsetWidth || 800
    const h = modal.clientHeight || modal.offsetHeight || 560

    if (w === 0 || h === 0) return

    modal.width = w
    modal.height = h

    // clear
    ctx.fillStyle = "#f7f7f7"
    ctx.fillRect(0, 0, w, h)

    // Calculate a fixed scale that makes the room fit nicely in the canvas
    // regardless of actual room dimensions (auto-fit with padding)
    const padding = 100 // pixels padding around the room
    const availableWidth = w - padding * 2
    const availableHeight = h - padding * 2

    const scaleX = availableWidth / room.width
    const scaleY = availableHeight / room.height
    const scale = Math.min(scaleX, scaleY, 0.25) // Cap at 0.25 max scale

    const roomWidthPx = room.width * scale
    const roomHeightPx = room.height * scale

    // Center position
    const roomX = (w - roomWidthPx) / 2
    const roomY = (h - roomHeightPx) / 2

    // Draw room shape with proper polygon
    const vertices = getRoomPolygon(roomX, roomY, roomWidthPx, roomHeightPx, room.shape)

    ctx.fillStyle = "#f5dcc4"
    ctx.strokeStyle = "#b0b0b0"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(vertices[0].x, vertices[0].y)
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y)
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Draw subtle grid inside the room shape for better visual reference
    ctx.save()
    ctx.clip() // Clip to room shape
    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)"
    ctx.lineWidth = 1
    const gridSpacing = 50 // pixels
    for (let x = roomX; x <= roomX + roomWidthPx; x += gridSpacing) {
      ctx.beginPath()
      ctx.moveTo(x, roomY)
      ctx.lineTo(x, roomY + roomHeightPx)
      ctx.stroke()
    }
    for (let y = roomY; y <= roomY + roomHeightPx; y += gridSpacing) {
      ctx.beginPath()
      ctx.moveTo(roomX, y)
      ctx.lineTo(roomX + roomWidthPx, y)
      ctx.stroke()
    }
    ctx.restore()

    // Draw Sloped Ceilings (Always Visible)
    // Calculate offset lines
    // console.log("[PlannerCanvas] Rendering sloped ceilings", { count: slopedCeilings.length, activeTool, selectedWallId })
    const offsetLines = vertices.map((p1, i) => {
      const p2 = vertices[(i + 1) % vertices.length]
      const wallId = i.toString()
      const slope = slopedCeilings.find(s => s.wallId === wallId)
      // if (slope) console.log("[PlannerCanvas] Found slope for wall", wallId, slope)

      let offset = 0
      if (slope) {
        offset = slope.b * scale
      } else if (activeTool === "ceiling" && wallId === selectedWallId) {
        offset = 1400 * scale // Default preview only when tool is active
      }

      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const len = Math.sqrt(dx * dx + dy * dy)
      const nx = -dy / len
      const ny = dx / len

      return {
        p1: { x: p1.x + nx * offset, y: p1.y + ny * offset },
        p2: { x: p2.x + nx * offset, y: p2.y + ny * offset }
      }
    })

    // Calculate inner vertices (intersections)
    const innerVertices = offsetLines.map((l1, i) => {
      const l2 = offsetLines[(i + 1) % offsetLines.length]

      const x1 = l1.p1.x, y1 = l1.p1.y, x2 = l1.p2.x, y2 = l1.p2.y
      const x3 = l2.p1.x, y3 = l2.p1.y, x4 = l2.p2.x, y4 = l2.p2.y

      const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
      if (Math.abs(denom) < 0.001) return l1.p2 // Parallel/Collinear fallback

      const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom
      return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1)
      }
    })

    // Draw Inner Polygon (Flat Ceiling)
    // Only draw if there is at least one slope or preview
    const hasAnySlope = slopedCeilings.length > 0 || (activeTool === "ceiling" && selectedWallId)

    if (hasAnySlope) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.beginPath()
      if (innerVertices.length > 0) {
        ctx.moveTo(innerVertices[0].x, innerVertices[0].y)
        for (let i = 1; i < innerVertices.length; i++) {
          ctx.lineTo(innerVertices[i].x, innerVertices[i].y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = "#888"
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw Slope Areas (Blue Visualization)
      vertices.forEach((p1, i) => {
        const wallId = i.toString()
        const slope = slopedCeilings.find(s => s.wallId === wallId)
        const isSelected = activeTool === "ceiling" && wallId === selectedWallId

        if (slope || isSelected) {
          const p2 = vertices[(i + 1) % vertices.length]
          const innerP2 = innerVertices[i]
          const innerP1 = innerVertices[(i - 1 + vertices.length) % vertices.length]

          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.lineTo(innerP2.x, innerP2.y)
          ctx.lineTo(innerP1.x, innerP1.y)
          ctx.closePath()

          ctx.fillStyle = "rgba(59, 130, 246, 0.2)" // Blue transparent
          ctx.fill()
          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      // Draw Slope Lines (Diagonals)
      ctx.strokeStyle = "#888"
      ctx.lineWidth = 1
      for (let i = 0; i < vertices.length; i++) {
        ctx.beginPath()
        ctx.moveTo(vertices[i].x, vertices[i].y)
        ctx.lineTo(innerVertices[i].x, innerVertices[i].y)
        ctx.stroke()
      }
    }

    // Draw Indicators (Circles) - ONLY when tool is active
    if (activeTool === "ceiling") {
      // Highlight Selected Wall
      if (selectedWallId) {
        const idx = parseInt(selectedWallId)
        if (!isNaN(idx) && idx >= 0 && idx < vertices.length) {
          const p1 = vertices[idx]
          const p2 = vertices[(idx + 1) % vertices.length]

          ctx.strokeStyle = "#3b82f6" // Blue
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }

      // Draw Indicators (Circles) on each wall edge
      vertices.forEach((p1, i) => {
        const p2 = vertices[(i + 1) % vertices.length]
        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2

        // Draw circle shadow/border
        ctx.beginPath()
        ctx.arc(midX, midY, 12, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
        ctx.fill()

        // Draw white circle
        ctx.beginPath()
        ctx.arc(midX, midY, 10, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffff"
        ctx.fill()
        ctx.strokeStyle = "#e5e7eb" // Light gray border
        ctx.lineWidth = 1
        ctx.stroke()
      })
    }

    // Draw existing walls (placedItems of type 'wall-segment')
    const existingWalls = placedItems.filter(item => item.type === 'wall-segment');
    existingWalls.forEach(wall => {
      const wallX = roomX + wall.x * scale;
      const wallY = roomY + wall.y * scale;
      const wallWidth = wall.width * scale;
      const wallHeight = wall.height * scale;

      ctx.save();
      ctx.translate(wallX, wallY);
      ctx.rotate((wall.rotation * Math.PI) / 180);

      // Draw wall
      ctx.fillStyle = "#9ca3af";
      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 3;
      ctx.fillRect(0, -wallHeight / 2, wallWidth, wallHeight);
      ctx.strokeRect(0, -wallHeight / 2, wallWidth, wallHeight);

      ctx.restore();
    });

    // Calculate and draw sub-areas if walls exist (including temp walls)
    const allWalls = [...existingWalls];
    // Add temp walls to calculation if needed, but temp walls are just lines, not placedItems yet.
    // For accurate preview, we should ideally include temp walls in the area calculation, 
    // but let's start with existing walls to match the main view.

    let subAreasDrawn = false;

    if (allWalls.length > 0) {
      // Grid resolution in mm (larger = faster but less accurate)
      const resolution = 50;
      const cols = Math.ceil(room.width / resolution);
      const rows = Math.ceil(room.height / resolution);
      const grid = new Int8Array(cols * rows).fill(0); // 0: unknown, 1: wall/outside, 2+: area id

      // Initialize grid: mark outside as 1
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = x * resolution + resolution / 2;
          const py = y * resolution + resolution / 2;

          const vertices = getRoomPolygon(0, 0, room.width, room.height, room.shape);

          // Point in polygon check
          let inside = false;
          for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x, yi = vertices[i].y;
            const xj = vertices[j].x, yj = vertices[j].y;
            const intersect = ((yi > py) !== (yj > py)) &&
              (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
          }

          if (!inside) {
            grid[y * cols + x] = 1; // Outside
          }
        }
      }

      // Mark walls
      allWalls.forEach(wall => {
        const x0 = wall.x / resolution;
        const y0 = wall.y / resolution;
        const angle = wall.rotation * Math.PI / 180;
        const len = wall.width / resolution;
        const x1 = x0 + Math.cos(angle) * len;
        const y1 = y0 + Math.sin(angle) * len;

        const steps = Math.ceil(len * 2); // Ensure no gaps
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const cx = Math.floor(x0 + (x1 - x0) * t);
          const cy = Math.floor(y0 + (y1 - y0) * t);
          if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
            grid[cy * cols + cx] = 1; // Wall
          }
        }
      });

      // Flood fill
      const areas: { id: number, count: number, sumX: number, sumY: number }[] = [];
      let currentId = 2;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[y * cols + x] === 0) {
            const stack = [[x, y]];
            grid[y * cols + x] = currentId;
            let count = 0;
            let sumX = 0;
            let sumY = 0;

            while (stack.length > 0) {
              const [cx, cy] = stack.pop()!;
              count++;
              sumX += cx;
              sumY += cy;

              const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
              for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny * cols + nx] === 0) {
                  grid[ny * cols + nx] = currentId;
                  stack.push([nx, ny]);
                }
              }
            }

            // Filter small noise areas (< 0.1 m2)
            if (count * resolution * resolution / 1000000 > 0.1) {
              areas.push({ id: currentId, count, sumX, sumY });
              currentId++;
            }
          }
        }
      }

      // Draw area labels
      if (areas.length > 0) {
        subAreasDrawn = true;
        areas.forEach((area, index) => {
          const areaM2 = (area.count * resolution * resolution) / 1000000;
          const centerX = (area.sumX / area.count) * resolution;
          const centerY = (area.sumY / area.count) * resolution;

          const labelX = roomX + centerX * scale;
          const labelY = roomY + centerY * scale;

          ctx.fillStyle = "#000";
          ctx.font = "14px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`Area ${index + 1}`, labelX, labelY - 10);
          ctx.fillText(`${areaM2.toFixed(1)} m²`, labelX, labelY + 10);
        });
      }
    }

    if (!subAreasDrawn) {
      // Draw room label (Area name and size)
      ctx.fillStyle = "#111"
      ctx.font = "14px system-ui, -apple-system, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const areaText = room.name || "Area 1"
      const areaSize = `${Math.round(room.area)} m²`
      ctx.fillText(areaText, roomX + roomWidthPx / 2, roomY + roomHeightPx / 2 - 10)
      ctx.fillText(areaSize, roomX + roomWidthPx / 2, roomY + roomHeightPx / 2 + 10)
    }

    // Draw interior lines for specific shapes
    if (room.shape === "open-l") {
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 2
      ctx.setLineDash([10, 5])
      ctx.beginPath()
      ctx.moveTo(roomX, roomY + roomHeightPx * 0.5)
      ctx.lineTo(roomX + roomWidthPx, roomY + roomHeightPx * 0.5)
      ctx.stroke()
      ctx.setLineDash([])
    } else if (room.shape === "rectangle") {
      ctx.strokeStyle = "#666"
      ctx.lineWidth = 2
      ctx.setLineDash([10, 5])
      ctx.beginPath()
      ctx.moveTo(roomX + roomWidthPx * 0.5, roomY)
      ctx.lineTo(roomX + roomWidthPx * 0.5, roomY + roomHeightPx)
      ctx.stroke()
      ctx.setLineDash([])
    }



    // Draw water supplies if any
    waterSupplies.forEach((supply) => {
      const supplyX = roomX + supply.x * scale
      const supplyY = roomY + supply.y * scale
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(supplyX, supplyY, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw clickable corner points for visual reference
    vertices.forEach((vertex, idx) => {
      ctx.fillStyle = "#999"
      ctx.beginPath()
      ctx.arc(vertex.x, vertex.y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // draw temp walls scaled with proper wall thickness
    if (tempWalls.length > 0) {
      const isSeparation = activeTool === "separation"
      ctx.strokeStyle = isSeparation ? "#9ca3af" : "#9ca3af"
      ctx.lineWidth = isSeparation ? 2 : 8
      ctx.lineCap = "round"
      tempWalls.forEach((seg, index) => {
        const sx = roomX + seg.start.x * scale
        const sy = roomY + seg.start.y * scale
        const ex = roomX + seg.end.x * scale
        const ey = roomY + seg.end.y * scale
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(ex, ey)
        ctx.stroke()

        // Draw wall end points
        ctx.fillStyle = "#9ca3af"
        ctx.beginPath()
        ctx.arc(sx, sy, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(ex, ey, 5, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw wall start point if currently drawing
    if (wallStart && isDrawingWall) {
      const isSeparation = activeTool === "separation"
      const sx = roomX + wallStart.x * scale
      const sy = roomY + wallStart.y * scale
      ctx.fillStyle = isSeparation ? "#9ca3af" : "#60a5fa"
      ctx.beginPath()
      ctx.arc(sx, sy, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // preview
    if (wallStart && wallPreview) {
      const isSeparation = activeTool === "separation"
      const sx = roomX + wallStart.x * scale
      const sy = roomY + wallStart.y * scale
      const ex = roomX + wallPreview.x * scale
      const ey = roomY + wallPreview.y * scale

      ctx.save()
      ctx.strokeStyle = isSeparation ? "#9ca3af" : "#60a5fa"
      ctx.lineWidth = isSeparation ? 2 : 8
      ctx.lineCap = "butt"
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.stroke()
      ctx.restore()

      // Draw preview end point
      ctx.fillStyle = isSeparation ? "#9ca3af" : "#60a5fa"
      ctx.beginPath()
      ctx.arc(ex, ey, 4, 0, Math.PI * 2)
      ctx.fill()

      // Draw measurements
      // Show measurements for both walls and separation lines during drawing
      if (true) {
        const dx = ex - sx
        const dy = ey - sy
        const lengthPx = Math.sqrt(dx * dx + dy * dy)
        const lengthMm = Math.sqrt(Math.pow(wallPreview.x - wallStart.x, 2) + Math.pow(wallPreview.y - wallStart.y, 2))

        if (lengthPx > 20) {
          const angle = Math.atan2(dy, dx)
          const offset = 30

          ctx.save()
          ctx.translate(sx, sy)
          ctx.rotate(angle)

          ctx.strokeStyle = "#333"
          ctx.lineWidth = 1
          ctx.fillStyle = "#333"
          ctx.font = "12px sans-serif"
          ctx.textAlign = "center"

          // Top measurement
          ctx.textBaseline = "bottom"
          ctx.beginPath()
          ctx.moveTo(0, -offset)
          ctx.lineTo(lengthPx, -offset)
          ctx.moveTo(0, -offset + 5)
          ctx.lineTo(0, -offset - 5)
          ctx.moveTo(lengthPx, -offset + 5)
          ctx.lineTo(lengthPx, -offset - 5)
          ctx.stroke()

          const text = `${Math.round(lengthMm)} mm`
          const textWidth = ctx.measureText(text).width
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
          ctx.fillRect(lengthPx / 2 - textWidth / 2 - 2, -offset - 14, textWidth + 4, 14)
          ctx.fillStyle = "#333"
          ctx.fillText(text, lengthPx / 2, -offset - 2)

          // Bottom measurement
          ctx.textBaseline = "top"
          ctx.beginPath()
          ctx.moveTo(0, offset)
          ctx.lineTo(lengthPx, offset)
          ctx.moveTo(0, offset - 5)
          ctx.lineTo(0, offset + 5)
          ctx.moveTo(lengthPx, offset - 5)
          ctx.lineTo(lengthPx, offset + 5)
          ctx.stroke()

          ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
          ctx.fillRect(lengthPx / 2 - textWidth / 2 - 2, offset + 2, textWidth + 4, 14)
          ctx.fillStyle = "#333"
          ctx.fillText(text, lengthPx / 2, offset + 2)

          ctx.restore()
        }
      }
    }

  }, [room, tempWalls, wallStart, wallPreview, isDrawingWall, waterSupplies, slopedCeilings, activeTool, forceRedraw, modalCanvasElement, selectedWallId])

  // Force redraw when activeTool changes to "wall"
  useEffect(() => {
    if (activeTool === "wall" || activeTool === "separation") {
      setForceRedraw(prev => prev + 1)
    }
  }, [activeTool])

  // Helper function to check if a point is inside the room polygon
  const isPointInRoom = (
    px: number,
    py: number,
    roomX: number,
    roomY: number,
    roomWidthPx: number,
    roomHeightPx: number,
    shape: string
  ): boolean => {
    const vertices = getRoomPolygon(roomX, roomY, roomWidthPx, roomHeightPx, shape)

    // First check if point is strictly inside using ray casting
    let inside = false
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x, yi = vertices[i].y
      const xj = vertices[j].x, yj = vertices[j].y

      const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }

    // If inside, return true
    if (inside) return true

    // Also check if point is near any edge (within 15 pixels) - allows clicking on edges
    const edgeThreshold = 15
    for (let i = 0; i < vertices.length; i++) {
      const start = vertices[i]
      const end = vertices[(i + 1) % vertices.length]

      const dx = end.x - start.x
      const dy = end.y - start.y
      const length = Math.sqrt(dx * dx + dy * dy)

      if (length === 0) continue

      // Calculate distance from point to line segment
      const t = Math.max(0, Math.min(1, ((px - start.x) * dx + (py - start.y) * dy) / (length * length)))
      const projX = start.x + t * dx
      const projY = start.y + t * dy
      const dist = Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)

      if (dist < edgeThreshold) return true
    }

    return false
  }

  // Attach interaction handlers to the modal canvas so users can click-to-start
  // and click-to-end wall segments inside the Add Wall modal. This keeps the
  // wall state centralized in this component (tempWalls, wallStart, etc.).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel current wall drawing
      if (e.key === 'Escape' && isDrawingWall) {
        setIsDrawingWall(false)
        setWallStart(null)
        setWallPreview(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isDrawingWall])

  const getRoomInteractionType = (
    x: number,
    y: number,
    roomX: number,
    roomY: number,
    roomWidthPx: number,
    roomHeightPx: number,
  ): RoomInteraction => {
    const handleSize = 12

    if (Math.abs(x - roomX) < handleSize && Math.abs(y - roomY) < handleSize) return "resize-top-left"
    if (Math.abs(x - (roomX + roomWidthPx)) < handleSize && Math.abs(y - roomY) < handleSize) return "resize-top-right"
    if (Math.abs(x - roomX) < handleSize && Math.abs(y - (roomY + roomHeightPx)) < handleSize)
      return "resize-bottom-left"
    if (Math.abs(x - (roomX + roomWidthPx)) < handleSize && Math.abs(y - (roomY + roomHeightPx)) < handleSize)
      return "resize-bottom-right"

    if (Math.abs(y - roomY) < handleSize && x > roomX && x < roomX + roomWidthPx) return "resize-top"
    if (Math.abs(x - (roomX + roomWidthPx)) < handleSize && y > roomY && y < roomY + roomHeightPx) return "resize-right"
    if (Math.abs(y - (roomY + roomHeightPx)) < handleSize && x > roomX && x < roomX + roomWidthPx)
      return "resize-bottom"
    if (Math.abs(x - roomX) < handleSize && y > roomY && y < roomY + roomHeightPx) return "resize-left"

    if (x >= roomX && x <= roomX + roomWidthPx && y >= roomY && y <= roomY + roomHeightPx) return "drag"

    return "none"
  }

  const getCursor = (interaction: RoomInteraction): string => {
    // If wall drawing tool is active, prefer a pencil-style cursor (fallback to crosshair)
    const tool = usePlannerStore.getState().activeTool || ""
    if (tool === "wall" || tool === "separation") return "crosshair"

    // For resize interactions, we need to check the active edge/corner to return the correct cursor
    // This is a bit tricky because interaction state doesn't carry the index, but we have activeEdgeIndex/activeCornerIndex in state

    if (interaction === "resize-edge" && activeEdgeIndex >= 0 && room) {
      const direction = getEdgeResizeDirection(room.shape, activeEdgeIndex)
      if (direction === 'top' || direction === 'bottom') return "ns-resize"
      if (direction === 'left' || direction === 'right') return "ew-resize"
      if (direction === 'top-right') return "nesw-resize"
      return "default"
    }

    if (interaction === "resize-corner" && activeCornerIndex >= 0 && room) {
      const direction = getCornerResizeDirection(room.shape, activeCornerIndex)
      if (direction === 'tl' || direction === 'br') return "nwse-resize"
      if (direction === 'tr' || direction === 'bl') return "nesw-resize"
      return "default"
    }

    switch (interaction) {
      case "drag":
        return "move"
      case "resize-top":
      case "resize-bottom":
        return "ns-resize"
      case "resize-left":
      case "resize-right":
        return "ew-resize"
      case "resize-top-left":
      case "resize-bottom-right":
        return "nwse-resize"
      case "resize-top-right":
      case "resize-bottom-left":
        return "nesw-resize"
      default:
        return "crosshair"
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!room || !canvasRef.current) return

    const itemType = e.dataTransfer.getData("itemType")
    if (!itemType) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const scale = 0.15 * zoom
    const roomWidthPx = room.width * scale
    const roomHeightPx = room.height * scale
    const roomX = (canvas.width - roomWidthPx) / 2
    const roomY = (canvas.height - roomHeightPx) / 2

    const roomRelX = (x - roomX) / scale
    const roomRelY = (y - roomY) / scale

    if (roomRelX < 0 || roomRelX > room.width || roomRelY < 0 || roomRelY > room.height) {
      return
    }

    const snapSize = 50 // Better snap for furniture
    const snappedX = Math.round(roomRelX / snapSize) * snapSize
    const snappedY = Math.round(roomRelY / snapSize) * snapSize

    let width = 600
    let height = 600

    if (itemType === "Box object") {
      width = 1500 // Big white square (approx large furniture/island)
      height = 1000
    } else if (itemType === "Column square") {
      width = 300 // Small square
      height = 300
    } else if (itemType === "Column round") {
      width = 300 // Small circle
      height = 300
    } else if (itemType === "Double electric socket" || itemType === "Double light switch") {
      width = 120
      height = 20
    } else if (itemType === "Single electric socket" || itemType === "Single light switch") {
      width = 60
      height = 20
    } else if (itemType === "Radiator") {
      width = 800
      height = 30
    } else if (itemType === "Air vent") {
      width = 300
      height = 50
    } else if (itemType === "floor drain") {
      width = 200
      height = 200
    } else if (itemType.toLowerCase().includes("gas pipe")) {
      width = 1000
      height = 40
      // If it's explicitly vertical, we could rotate it, but usually width/height swap is better for visual consistency if rotation is 0
      if (itemType.toLowerCase().includes("vertical")) {
        // Swap for vertical defaults? Or just rely on user rotating?
        // Let's swap to be helpful
        const temp = width; width = height; height = temp;
      }
    } else if (itemType.toLowerCase().includes("water pipe")) {
      width = 300
      height = 150
    } else if (itemType.toLowerCase().includes("pipe")) {
      // Generic pipe
      width = 1000
      height = 30
      if (itemType.toLowerCase().includes("vertical")) {
        const temp = width; width = height; height = temp;
      }
    } else if (itemType === "Double window") {
      width = 1200
      height = 200 // Wall thickness
    } else if (itemType === "Single window") {
      width = 800
      height = 200
    } else if (itemType === "Roof Window") {
      width = 1200
      height = 200
    } else if (itemType === "Non opening window") {
      width = 1000
      height = 200
    } else if (["Double Interior door", "Patio Door"].includes(itemType)) {
      width = 1600
      height = 200
    } else if (itemType === "Simple door") {
      width = 900
      height = 200
    }

    const newItem: PlacedItem = {
      id: `item-${Date.now()}`,
      type: itemType,
      x: snappedX,
      y: snappedY,
      rotation: 0,
      width,
      height,
    }

    addPlacedItem(newItem)
    setSelectedItemId(newItem.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!room || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const scale = 0.15 * zoom
    const roomWidthPx = room.width * scale
    const roomHeightPx = room.height * scale
    const roomX = roomOffset.x || (canvas.width - roomWidthPx) / 2
    const roomY = roomOffset.y || (canvas.height - roomHeightPx) / 2

    const vertices = getRoomPolygon(roomX, roomY, roomWidthPx, roomHeightPx, room.shape)
    const edges = getPolygonEdges(vertices)

    for (let i = 0; i < vertices.length; i++) {
      if (isNearCorner(x, y, vertices[i])) {
        setRoomInteraction("resize-corner")
        setActiveCornerIndex(i)
        setCursorPosition({ x, y })
        setInitialRoomPosition({ x: roomX, y: roomY })
        setInitialRoomDimensions({ width: room.width, height: room.height })
        setSelectedItemId(null)
        // setClickedEdgeIndex(-1) // Keep clicked edge selected so we can see measurements while resizing corner
        setHasMouseMoved(false) // Reset mouse moved flag
        return
      }
    }

    for (const edge of edges) {
      if (isNearEdge(x, y, edge)) {
        // Set clicked edge to show measurement
        setClickedEdgeIndex(edge.index)

        // Also prepare for potential resize
        setRoomInteraction("resize-edge")
        setActiveEdgeIndex(edge.index)
        setCursorPosition({ x, y })
        setInitialRoomPosition({ x: roomX, y: roomY })
        setInitialRoomDimensions({ width: room.width, height: room.height })
        setSelectedItemId(null)
        setHasMouseMoved(false) // Reset mouse moved flag
        return
      }
    }

    // Check for Item Handles first (if item selected)
    if (selectedItemId) {
      const item = placedItems.find((i) => i.id === selectedItemId)
      if (item && item.type !== "wall-segment" && item.type !== "separation-line") {
        const { handles } = getHandlePositions(item, roomX, roomY, scale)
        const handleRadius = 8

        // Check rotation handle
        const rotDist = Math.sqrt((x - handles.rotate.x) ** 2 + (y - handles.rotate.y) ** 2)
        if (rotDist <= handleRadius) {
          setItemInteraction("rotate")
          setInteractionStart({ mouse: { x, y }, item: { ...item } })
          return
        }

        // Check resize handles
        for (const [key, pos] of Object.entries(handles)) {
          if (key === "rotate") continue
          const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)
          if (dist <= handleRadius) {
            setItemInteraction(`resize-${key}` as ItemInteraction)
            setInteractionStart({ mouse: { x, y }, item: { ...item } })
            return
          }
        }
      }
    }

    for (let i = placedItems.length - 1; i >= 0; i--) {
      const item = placedItems[i]
      const itemX = roomX + item.x * scale
      const itemY = roomY + item.y * scale
      const itemWidth = item.width * scale
      const itemHeight = item.height * scale

      let isHit = false

      if (item.type === "wall-segment" || item.type === "separation-line") {
        // For wall segments, check if click is near the rotated line
        const angle = (item.rotation * Math.PI) / 180
        const dx = x - itemX
        const dy = y - itemY

        // Rotate click point to wall's local coordinate system
        const localX = dx * Math.cos(-angle) - dy * Math.sin(-angle)
        const localY = dx * Math.sin(-angle) + dy * Math.cos(-angle)

        // Check if click is within wall bounds (extending from origin)
        isHit = localX >= -10 && localX <= itemWidth + 10 &&
          localY >= -itemHeight / 2 - 10 && localY <= itemHeight / 2 + 10
      } else {
        // Regular rectangular hit detection for other items
        // We need to check rotated bounds for accurate selection
        const cx = itemX + itemWidth / 2
        const cy = itemY + itemHeight / 2
        const p = rotatePoint(x, y, cx, cy, -item.rotation)

        // In local unrotated space, item is centered at cx, cy with width/height
        isHit = Math.abs(p.x - cx) <= itemWidth / 2 && Math.abs(p.y - cy) <= itemHeight / 2
      }

      if (isHit) {
        const currentTool = usePlannerStore.getState().activeTool
        if (currentTool === "wall" || currentTool === "separation") {
          continue
        }

        setSelectedItemId(item.id)
        // Start Dragging
        setItemInteraction("drag")
        setInteractionStart({ mouse: { x, y }, item: { ...item } })
        setClickedEdgeIndex(-1) // Clear clicked edge when selecting an item
        return
      }
    }

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(vertices[0].x, vertices[0].y)
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y)
      }
      ctx.closePath()

      if (ctx.isPointInPath(x, y)) {
        // If wall tool is active, start a drawing sequence
        const currentTool = usePlannerStore.getState().activeTool
        if (currentTool === "wall" || currentTool === "separation") {
          const roomRelX = (x - roomX) / (0.15 * zoom)
          const roomRelY = (y - roomY) / (0.15 * zoom)
          setIsDrawingWall(true)
          setWallStart({ x: Math.max(0, Math.min(room.width, Math.round(roomRelX))), y: Math.max(0, Math.min(room.height, Math.round(roomRelY))) })
          setWallPreview(null)
          setSelectedItemId(null)
          setClickedEdgeIndex(-1) // Clear clicked edge when drawing walls
          return
        }

        // Only deselect if we clicked empty space in room and weren't interacting with an item
        if (!selectedItemId) {
          setRoomInteraction("drag")
          setCursorPosition({ x, y })
          setInitialRoomPosition({ x: roomX, y: roomY })
          setClickedEdgeIndex(-1) // Clear clicked edge when clicking empty space
        } else {
          // Deselect if clicked on room background away from item
          setSelectedItemId(null)
          setClickedEdgeIndex(-1) // Clear clicked edge when deselecting
        }
        return
      }
    }

    setSelectedItemId(null)
    setClickedEdgeIndex(-1) // Clear clicked edge when clicking outside room
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!room || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const scale = 0.15 * zoom
    const displayWidth = tempDimensions?.width || room.width
    const displayHeight = tempDimensions?.height || room.height
    const roomWidthPx = displayWidth * scale
    const roomHeightPx = displayHeight * scale
    const roomX = roomOffset.x || (canvas.width - roomWidthPx) / 2
    const roomY = roomOffset.y || (canvas.height - roomHeightPx) / 2

    // Handle Item Interaction
    if (itemInteraction !== "none" && interactionStart && selectedItemId) {
      const item = interactionStart.item
      const dx = x - interactionStart.mouse.x
      const dy = y - interactionStart.mouse.y
      const scaleInverse = 1 / scale

      if (itemInteraction === "drag") {
        const newX = item.x + dx * scaleInverse
        const newY = item.y + dy * scaleInverse

        updatePlacedItem(item.id, {
          x: snapToGrid(newX),
          y: snapToGrid(newY),
        })
      } else if (itemInteraction === "rotate") {
        const itemCx = roomX + (item.x + item.width / 2) * scale
        const itemCy = roomY + (item.y + item.height / 2) * scale

        const angle = Math.atan2(y - itemCy, x - itemCx) * (180 / Math.PI) + 90
        const snappedAngle = Math.round(angle / 15) * 15

        updatePlacedItem(item.id, {
          rotation: (snappedAngle + 360) % 360
        })
      } else if (itemInteraction.startsWith("resize")) {
        // Convert delta to local space
        const rad = -(item.rotation * Math.PI) / 180
        const localDx = (dx * Math.cos(rad) - dy * Math.sin(rad)) * scaleInverse
        const localDy = (dx * Math.sin(rad) + dy * Math.cos(rad)) * scaleInverse

        let newW = item.width
        let newH = item.height
        let newX = item.x
        let newY = item.y

        // Calculate new dimensions and position based on handle
        // Note: item.x/y is top-left. When resizing, we may need to shift x/y to keep opposite side fixed.
        // But since we rotate around center, it's easier to think about center shift.
        // Let's calculate change in width/height first.

        const type = itemInteraction.replace("resize-", "")

        let dW = 0
        let dH = 0
        let shiftX = 0 // Local shift
        let shiftY = 0 // Local shift

        if (type.includes("e")) { dW = localDx; shiftX = localDx / 2 }
        if (type.includes("w")) { dW = -localDx; shiftX = -localDx / 2 }
        if (type.includes("s")) { dH = localDy; shiftY = localDy / 2 }
        if (type.includes("n")) { dH = -localDy; shiftY = -localDy / 2 }

        // Proportional resizing for corners
        if (type.length === 2) { // ne, nw, se, sw
          // TODO: Implement strict proportional if needed, for now free resize is often better for furniture
          // Unless user holds shift? The prompt says "Corner handles must resize proportionally"
          // Let's enforce aspect ratio
          const ratio = item.width / item.height
          if (Math.abs(dW) > Math.abs(dH)) {
            dH = dW / ratio
          } else {
            dW = dH * ratio
          }

          // Re-calculate shifts based on enforced dW/dH
          shiftX = 0; shiftY = 0
          if (type.includes("e")) shiftX = dW / 2
          if (type.includes("w")) shiftX = -dW / 2
          if (type.includes("s")) shiftY = dH / 2
          if (type.includes("n")) shiftY = -dH / 2
        }

        newW = Math.max(100, item.width + dW)
        newH = Math.max(100, item.height + dH)

        // Snap dimensions
        newW = snapToGrid(newW)
        newH = snapToGrid(newH)

        // Re-calculate actual delta after snapping
        const finalDW = newW - item.width
        const finalDH = newH - item.height

        // Apply position shift (rotated back to global)
        // We need to shift the center by (shiftX, shiftY)
        // But shiftX/Y were based on dW/dH. Let's recompute based on finalDW/finalDH
        let finalShiftX = 0
        let finalShiftY = 0

        if (type.includes("e")) finalShiftX = finalDW / 2
        if (type.includes("w")) finalShiftX = -finalDW / 2
        if (type.includes("s")) finalShiftY = finalDH / 2
        if (type.includes("n")) finalShiftY = -finalDH / 2

        // Rotate shift vector back to global
        const rot = (item.rotation * Math.PI) / 180
        const globalShiftX = finalShiftX * Math.cos(rot) - finalShiftY * Math.sin(rot)
        const globalShiftY = finalShiftX * Math.sin(rot) + finalShiftY * Math.cos(rot)

        updatePlacedItem(item.id, {
          width: newW,
          height: newH,
          x: item.x + globalShiftX, // Adjust position to keep center relative to resize
          y: item.y + globalShiftY
        })
      }
      return
    }

    if (roomInteraction === "drag") {
      const deltaX = x - cursorPosition.x
      const deltaY = y - cursorPosition.y
      setRoomOffset({ x: roomX + deltaX, y: roomY + deltaY })
      setCursorPosition({ x, y })
      return
    }

    // Wall drawing mouse move: update preview point while drawing
    if (isDrawingWall && wallStart) {
      const roomRelX = (x - roomX) / (0.15 * zoom)
      const roomRelY = (y - roomY) / (0.15 * zoom)
      setWallPreview({ x: Math.max(0, Math.min(room.width, Math.round(roomRelX))), y: Math.max(0, Math.min(room.height, Math.round(roomRelY))) })
      return
    }

    if (roomInteraction === "resize-edge" && activeEdgeIndex >= 0 && room.shape === "l-shape") {
      // Handle L-Shape specific edge resizing (Edge 1 and 2)
      if (activeEdgeIndex === 1 || activeEdgeIndex === 2) {
        setHasMouseMoved(true)
        const deltaX = x - cursorPosition.x
        const deltaY = y - cursorPosition.y
        const scaleInverse = 1 / (0.15 * zoom)

        // Default params if not set
        const currentCutWidth = room.params?.cutWidth ?? (room.width * (20 / 70))
        const currentCutHeight = room.params?.cutHeight ?? (room.height * (20 / 70))

        if (activeEdgeIndex === 1) {
          // Vertical Cut Edge (moving left/right)
          // Moving right (positive deltaX) decreases cutWidth (increases top wall width)
          // Moving left (negative deltaX) increases cutWidth
          const newCutWidth = Math.max(100, Math.min(room.width - 100, currentCutWidth - deltaX * scaleInverse))
          updateRoomParams({ cutWidth: Math.round(newCutWidth) })
          setCursorPosition({ x, y }) // Update cursor pos to avoid jump
          return
        }

        if (activeEdgeIndex === 2) {
          // Horizontal Cut Edge (moving up/down)
          // Moving down (positive deltaY) increases cutHeight
          // Moving up (negative deltaY) decreases cutHeight
          const newCutHeight = Math.max(100, Math.min(room.height - 100, currentCutHeight + deltaY * scaleInverse))
          updateRoomParams({ cutHeight: Math.round(newCutHeight) })
          setCursorPosition({ x, y }) // Update cursor pos to avoid jump
          return
        }
      }
    }

    if (roomInteraction === "resize-edge" && activeEdgeIndex >= 0) {
      setHasMouseMoved(true) // Mark that mouse has moved during resize
      const deltaX = x - cursorPosition.x
      const deltaY = y - cursorPosition.y
      const scaleInverse = 1 / (0.15 * zoom)

      let newWidth = room.width
      let newHeight = room.height
      let nextRoomX = initialRoomPosition.x
      let nextRoomY = initialRoomPosition.y

      const direction = getEdgeResizeDirection(room.shape, activeEdgeIndex)

      if (direction === 'top') {
        // Top edge
        newHeight = Math.max(1000, initialRoomDimensions.height - deltaY * scaleInverse)
        nextRoomY = initialRoomPosition.y + deltaY

        if (newHeight <= 1000) {
          newHeight = 1000
          nextRoomY = (initialRoomPosition.y + initialRoomDimensions.height * scale) - (1000 * scale)
        }
      } else if (direction === 'right') {
        // Right edge
        newWidth = Math.max(1000, initialRoomDimensions.width + deltaX * scaleInverse)
      } else if (direction === 'bottom') {
        // Bottom edge
        newHeight = Math.max(1000, initialRoomDimensions.height + deltaY * scaleInverse)
      } else if (direction === 'left') {
        // Left edge
        newWidth = Math.max(1000, initialRoomDimensions.width - deltaX * scaleInverse)
        nextRoomX = initialRoomPosition.x + deltaX

        if (newWidth <= 1000) {
          newWidth = 1000
          nextRoomX = (initialRoomPosition.x + initialRoomDimensions.width * scale) - (1000 * scale)
        }
      } else if (direction === 'top-right') {
        // Top-right diagonal edge
        newWidth = Math.max(1000, initialRoomDimensions.width + deltaX * scaleInverse)
        newHeight = Math.max(1000, initialRoomDimensions.height - deltaY * scaleInverse)
        nextRoomY = initialRoomPosition.y + deltaY

        if (newHeight <= 1000) {
          newHeight = 1000
          nextRoomY = (initialRoomPosition.y + initialRoomDimensions.height * scale) - (1000 * scale)
        }
      }

      newWidth = Math.round(newWidth / 100) * 100
      newHeight = Math.round(newHeight / 100) * 100

      setTempDimensions({ width: newWidth, height: newHeight })
      updateRoomDimensions(newWidth, newHeight)

      if (nextRoomX !== initialRoomPosition.x || nextRoomY !== initialRoomPosition.y) {
        setRoomOffset({ x: nextRoomX, y: nextRoomY })
      }
      return
    }

    if (roomInteraction === "resize-corner" && activeCornerIndex >= 0) {
      setHasMouseMoved(true) // Mark that mouse has moved during resize
      const deltaX = x - cursorPosition.x
      const deltaY = y - cursorPosition.y
      const scaleInverse = 1 / (0.15 * zoom)

      let newWidth = room.width
      let newHeight = room.height
      let nextRoomX = initialRoomPosition.x
      let nextRoomY = initialRoomPosition.y

      const direction = getCornerResizeDirection(room.shape, activeCornerIndex)

      // Adjust based on which corner
      if (direction === 'tl') {
        // Top-left
        newWidth = Math.max(1000, initialRoomDimensions.width - deltaX * scaleInverse)
        newHeight = Math.max(1000, initialRoomDimensions.height - deltaY * scaleInverse)
        nextRoomX = initialRoomPosition.x + deltaX
        nextRoomY = initialRoomPosition.y + deltaY

        if (newWidth <= 1000) {
          newWidth = 1000
          nextRoomX = (initialRoomPosition.x + initialRoomDimensions.width * scale) - (1000 * scale)
        }
        if (newHeight <= 1000) {
          newHeight = 1000
          nextRoomY = (initialRoomPosition.y + initialRoomDimensions.height * scale) - (1000 * scale)
        }
      } else if (direction === 'tr') {
        // Top-right
        newWidth = Math.max(1000, initialRoomDimensions.width + deltaX * scaleInverse)
        newHeight = Math.max(1000, initialRoomDimensions.height - deltaY * scaleInverse)
        nextRoomY = initialRoomPosition.y + deltaY

        if (newHeight <= 1000) {
          newHeight = 1000
          nextRoomY = (initialRoomPosition.y + initialRoomDimensions.height * scale) - (1000 * scale)
        }
      } else if (direction === 'br') {
        // Bottom-right
        newWidth = Math.max(1000, initialRoomDimensions.width + deltaX * scaleInverse)
        newHeight = Math.max(1000, initialRoomDimensions.height + deltaY * scaleInverse)
      } else if (direction === 'bl') {
        // Bottom-left
        newWidth = Math.max(1000, initialRoomDimensions.width - deltaX * scaleInverse)
        newHeight = Math.max(1000, initialRoomDimensions.height + deltaY * scaleInverse)
        nextRoomX = initialRoomPosition.x + deltaX

        if (newWidth <= 1000) {
          newWidth = 1000
          nextRoomX = (initialRoomPosition.x + initialRoomDimensions.width * scale) - (1000 * scale)
        }
      }

      newWidth = Math.round(newWidth / 100) * 100
      newHeight = Math.round(newHeight / 100) * 100

      setTempDimensions({ width: newWidth, height: newHeight })
      updateRoomDimensions(newWidth, newHeight)

      if (nextRoomX !== initialRoomPosition.x || nextRoomY !== initialRoomPosition.y) {
        setRoomOffset({ x: nextRoomX, y: nextRoomY })
      }
      return
    }

    if (roomInteraction === "none" && !draggedItem) {
      // Check handles first for cursor update
      if (selectedItemId) {
        const item = placedItems.find(i => i.id === selectedItemId)
        if (item && item.type !== "wall-segment" && item.type !== "separation-line") {
          const { handles } = getHandlePositions(item, roomX, roomY, scale)
          const handleRadius = 8

          let cursor = ""
          // Check rotation
          if (Math.sqrt((x - handles.rotate.x) ** 2 + (y - handles.rotate.y) ** 2) <= handleRadius) {
            cursor = "grab"
          } else {
            // Check resize
            for (const [key, pos] of Object.entries(handles)) {
              if (key === "rotate") continue
              if (Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2) <= handleRadius) {
                // Map handle to cursor based on rotation
                // This is tricky because "n" handle might be pointing east if rotated 90deg
                // But standard UI usually keeps the cursor relative to the handle's function or screen direction?
                // Usually it's screen direction.
                // Let's approximate:
                if (key === 'n' || key === 's') cursor = "ns-resize"
                else if (key === 'e' || key === 'w') cursor = "ew-resize"
                else if (key === 'ne' || key === 'sw') cursor = "nesw-resize"
                else if (key === 'nw' || key === 'se') cursor = "nwse-resize"

                // Better: Rotate the cursor direction by the item rotation
                // But standard CSS cursors are fixed.
                // Let's stick to local semantics for now or simple mapping.
                break
              }
            }
          }

          if (cursor) {
            canvas.style.cursor = cursor
            return
          }
        }
      }

      const vertices = getRoomPolygon(roomX, roomY, roomWidthPx, roomHeightPx, room.shape)
      const edges = getPolygonEdges(vertices)

      // Check corners
      let foundCorner = false
      for (let i = 0; i < vertices.length; i++) {
        if (isNearCorner(x, y, vertices[i])) {
          setHoveredCornerIndex(i)
          setHoveredEdgeIndex(-1)
          if (activeTool !== "wall") canvas.style.cursor = "nwse-resize"
          foundCorner = true
          break
        }
      }

      if (!foundCorner) {
        setHoveredCornerIndex(-1)

        let foundEdge = false
        for (const edge of edges) {
          if (isNearEdge(x, y, edge)) {
            setHoveredEdgeIndex(edge.index)
            if (activeTool !== "wall") canvas.style.cursor = getEdgeCursor(edge)
            foundEdge = true
            break
          }
        }

        if (!foundEdge) {
          setHoveredEdgeIndex(-1)

          // Check if inside room
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.beginPath()
            ctx.moveTo(vertices[0].x, vertices[0].y)
            for (let i = 1; i < vertices.length; i++) {
              ctx.lineTo(vertices[i].x, vertices[i].y)
            }
            ctx.closePath()

            if (ctx.isPointInPath(x, y)) {
              if (activeTool !== "wall") canvas.style.cursor = "move"
            } else {
              if (activeTool !== "wall") canvas.style.cursor = "crosshair"
            }
          }
        } else {
          // Found edge, set cursor based on mapped direction
          if (activeTool !== "wall") {
            const direction = getEdgeResizeDirection(room.shape, hoveredEdgeIndex)
            if (direction === 'top' || direction === 'bottom') canvas.style.cursor = "ns-resize"
            else if (direction === 'left' || direction === 'right') canvas.style.cursor = "ew-resize"
            else if (direction === 'top-right') canvas.style.cursor = "nesw-resize"
            else canvas.style.cursor = "default"
          }
        }
      } else {
        // Found corner, set cursor based on mapped direction
        if (activeTool !== "wall") {
          const direction = getCornerResizeDirection(room.shape, hoveredCornerIndex)
          if (direction === 'tl' || direction === 'br') canvas.style.cursor = "nwse-resize"
          else if (direction === 'tr' || direction === 'bl') canvas.style.cursor = "nesw-resize"
          else canvas.style.cursor = "default"
        }
      }
    }

    if (draggedItem) {
      const roomRelX = (x - dragOffset.x - roomX) / scale
      const roomRelY = (y - dragOffset.y - roomY) / scale

      const snapSize = 100
      const snappedX = Math.round(roomRelX / snapSize) * snapSize
      const snappedY = Math.round(roomRelY / snapSize) * snapSize

      // For wall segments, don't constrain by width (they extend from start point)
      if (draggedItem.type === "wall-segment") {
        const constrainedX = Math.max(0, Math.min(room.width, snappedX))
        const constrainedY = Math.max(0, Math.min(room.height, snappedY))
        updatePlacedItem(draggedItem.id, {
          x: constrainedX,
          y: constrainedY,
        })
      } else {
        const constrainedX = Math.max(0, Math.min(room.width - draggedItem.width, snappedX))
        const constrainedY = Math.max(0, Math.min(room.height - draggedItem.height, snappedY))
        updatePlacedItem(draggedItem.id, {
          x: constrainedX,
          y: constrainedY,
        })
      }
    }
  }

  const handleCanvasMouseUp = () => {
    if (itemInteraction !== "none") {
      saveToHistory()
      setItemInteraction("none")
      setInteractionStart(null)
    }

    if (roomInteraction !== "none") {
      saveToHistory()
      setRoomInteraction("none")
      setActiveEdgeIndex(-1)
      setActiveCornerIndex(-1)
      setTempDimensions(null)

      // Only clear clicked edge if user actually dragged to resize
      if (hasMouseMoved) {
        setClickedEdgeIndex(-1)
      }
      setHasMouseMoved(false)
    }

    if (draggedItem) {
      saveToHistory()
    }
    setDraggedItem(null)

    // Finish wall segment on mouse up - end drawing after second click
    if (isDrawingWall && wallStart && wallPreview) {
      setTempWalls((prev) => [...prev, { start: wallStart, end: wallPreview }])
      // End drawing after second click
      setIsDrawingWall(false)
      setWallStart(null)
      setWallPreview(null)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        redo()
        return
      }

      if (!selectedItemId) return

      const selectedItem = placedItems.find((item) => item.id === selectedItemId)
      if (!selectedItem) return

      if (e.key === "Delete" || e.key === "Backspace") {
        removePlacedItem(selectedItemId)
        setSelectedItemId(null)
      } else if (e.key === "r" || e.key === "R") {
        updatePlacedItem(selectedItemId, {
          rotation: (selectedItem.rotation + 90) % 360,
        })
        saveToHistory()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedItemId, placedItems, updatePlacedItem, removePlacedItem, setSelectedItemId, saveToHistory, undo, redo])

  const handleRotateSelected = () => {
    if (!selectedItemId) return
    const selectedItem = placedItems.find((item) => item.id === selectedItemId)
    if (!selectedItem) return
    updatePlacedItem(selectedItemId, {
      rotation: (selectedItem.rotation + 90) % 360,
    })
    saveToHistory()
  }

  // Wall-drawing controls
  const handleWallUndo = () => {
    if (tempWalls.length > 0) {
      setTempWalls((prev) => prev.slice(0, -1))
      setWallStart((prev) => (prev && prev !== null ? prev : null))
    } else {
      undo()
    }
  }

  const handleWallRedo = () => {
    redo()
  }

  const handleWallCancel = () => {
    setTempWalls([])
    setIsDrawingWall(false)
    setWallStart(null)
    setWallPreview(null)
    setActiveTool("select")
  }

  const handleWallOk = () => {
    // Convert temp walls into placedItems (simple rectangular segments)
    tempWalls.forEach((seg, i) => {
      const dx = seg.end.x - seg.start.x
      const dy = seg.end.y - seg.start.y
      const length = Math.sqrt(dx * dx + dy * dy)

      // Use the START point as anchor, not center - this maintains proper positioning
      const rotation = (Math.atan2(dy, dx) * 180) / Math.PI

      const isSeparation = activeTool === "separation"

      const newItem: PlacedItem = {
        id: `${isSeparation ? 'sep' : 'wall'}-${Date.now()}-${i}`,
        type: isSeparation ? "separation-line" : "wall-segment",
        x: Math.round(seg.start.x), // Use start point directly
        y: Math.round(seg.start.y), // Use start point directly
        rotation: Math.round(rotation),
        width: Math.round(length),
        height: isSeparation ? 2 : 50, // Wall thickness (reduced from 100)
      }

      addPlacedItem(newItem)
      setSelectedItemId(newItem.id)
    })

    setTempWalls([])
    setIsDrawingWall(false)
    setWallStart(null)
    setWallPreview(null)
    setActiveTool("select")
  }

  const handleModalMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!room || !modalCanvasElement) return

    const canvas = modalCanvasElement
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const w = canvas.width
    const h = canvas.height
    const padding = 100
    const availableWidth = w - padding * 2
    const availableHeight = h - padding * 2
    const scaleX = availableWidth / room.width
    const scaleY = availableHeight / room.height
    const scale = Math.min(scaleX, scaleY, 0.25)
    const roomWidthPx = room.width * scale
    const roomHeightPx = room.height * scale
    const roomX = (w - roomWidthPx) / 2
    const roomY = (h - roomHeightPx) / 2

    // Check if click is inside the room shape
    if (isPointInRoom(x, y, roomX, roomY, roomWidthPx, roomHeightPx, room.shape)) {
      const roomRelX = (x - roomX) / scale
      const roomRelY = (y - roomY) / scale

      if (isDrawingWall && wallStart) {
        // Finish this wall
        setTempWalls((prev) => [...prev, { start: wallStart, end: { x: Math.round(roomRelX), y: Math.round(roomRelY) } }])
        setIsDrawingWall(false)
        setWallStart(null)
        setWallPreview(null)
      } else {
        // Start a new wall
        setIsDrawingWall(true)
        setWallStart({ x: Math.max(0, Math.min(room.width, Math.round(roomRelX))), y: Math.max(0, Math.min(room.height, Math.round(roomRelY))) })
        setWallPreview(null)
        setSelectedItemId(null)
      }
    }
  }

  const handleModalMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!room || !modalCanvasElement || !isDrawingWall || !wallStart) return

    const canvas = modalCanvasElement
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const w = canvas.width
    const h = canvas.height
    const padding = 100
    const availableWidth = w - padding * 2
    const availableHeight = h - padding * 2
    const scaleX = availableWidth / room.width
    const scaleY = availableHeight / room.height
    const scale = Math.min(scaleX, scaleY, 0.25)
    const roomWidthPx = room.width * scale
    const roomHeightPx = room.height * scale
    const roomX = (w - roomWidthPx) / 2
    const roomY = (h - roomHeightPx) / 2

    const roomRelX = (x - roomX) / scale
    const roomRelY = (y - roomY) / scale

    if (isPointInRoom(x, y, roomX, roomY, roomWidthPx, roomHeightPx, room.shape)) {
      setWallPreview({ x: Math.max(0, Math.min(room.width, Math.round(roomRelX))), y: Math.max(0, Math.min(room.height, Math.round(roomRelY))) })
    } else {
      setWallPreview(null)
    }
  }

  const handleSlopedCeilingMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!room || !modalCanvasElement) return

    const canvas = modalCanvasElement
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const w = canvas.width
    const h = canvas.height
    const padding = 100
    const availableWidth = w - padding * 2
    const availableHeight = h - padding * 2
    const scaleX = availableWidth / room.width
    const scaleY = availableHeight / room.height
    const scale = Math.min(scaleX, scaleY, 0.25)
    const roomWidthPx = room.width * scale
    const roomHeightPx = room.height * scale
    const roomX = (w - roomWidthPx) / 2
    const roomY = (h - roomHeightPx) / 2

    const vertices = getRoomPolygon(roomX, roomY, roomWidthPx, roomHeightPx, room.shape)

    // Check distance to edges
    let bestDist = Infinity
    let bestEdgeIndex = -1

    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i]
      const p2 = vertices[(i + 1) % vertices.length]

      // Distance from point (x,y) to line segment p1-p2
      const A = x - p1.x
      const B = y - p1.y
      const C = p2.x - p1.x
      const D = p2.y - p1.y

      const dot = A * C + B * D
      const lenSq = C * C + D * D
      let param = -1
      if (lenSq !== 0) // in case of 0 length line
        param = dot / lenSq

      let xx, yy

      if (param < 0) {
        xx = p1.x
        yy = p1.y
      }
      else if (param > 1) {
        xx = p2.x
        yy = p2.y
      }
      else {
        xx = p1.x + param * C
        yy = p1.y + param * D
      }

      const dx = x - xx
      const dy = y - yy
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < bestDist) {
        bestDist = dist
        bestEdgeIndex = i
      }
    }

    if (bestDist < 20) { // 20px threshold
      const wallId = bestEdgeIndex.toString()
      setSelectedWallId(wallId)

      // Auto-add slope if not exists
      const existingSlope = slopedCeilings.find(s => s.wallId === wallId)
      if (!existingSlope) {
        addSlopedCeiling({
          id: Math.random().toString(36).substr(2, 9),
          wallId: wallId,
          a: 1300,
          b: 1400,
          c: 0,
        })
      }
    } else {
      setSelectedWallId(null)
    }
  }

  const handleModalMouseUp = () => {
    // No-op, handled in MouseDown
  }

  const handleDeleteSelected = () => {
    if (!selectedItemId) return
    removePlacedItem(selectedItemId)
    setSelectedItemId(null)
  }

  if (!room) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">Select a room shape to begin</div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-crosshair"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />

      <WallCursor enabled={activeTool === "wall" || activeTool === "separation"} targetRef={canvasRef} />

      {activeTool === "wall" && (
        <>
          <AddWallModal
            visible={true}
            onCancel={handleWallCancel}
            onOk={handleWallOk}
            onUndo={handleWallUndo}
            onRedo={handleWallRedo}
            canvasRef={modalCanvasRef}
            onCanvasMount={setModalCanvasElement}
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUp}
          />
        </>
      )}

      {activeTool === "separation" && (
        <>
          <AreaSeparationModal
            visible={true}
            onCancel={handleWallCancel}
            onOk={handleWallOk}
            onUndo={handleWallUndo}
            onRedo={handleWallRedo}
            canvasRef={modalCanvasRef}
            onCanvasMount={setModalCanvasElement}
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUp}
          />
        </>
      )}

      {activeTool === "ceiling" && (
        <SlopedCeilingModal
          visible={true}
          onCancel={() => setActiveTool("select")}
          onOk={() => setActiveTool("select")}
          onUndo={undo}
          onRedo={redo}
          canvasRef={modalCanvasRef}
          onCanvasMount={setModalCanvasElement}
          onMouseDown={handleSlopedCeilingMouseDown}
          selectedWallId={selectedWallId}
          onCloseSidebar={() => setSelectedWallId(null)}
        />
      )}

      {selectedItemId && (
        <div className="absolute right-4 top-4 flex gap-2 rounded-lg bg-white p-2 shadow-lg">
          <Button variant="outline" size="sm" onClick={handleRotateSelected}>
            Rotate (R)
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ViewControls />
    </div>
  )
}

const getEdgeResizeDirection = (shape: string, edgeIndex: number): 'top' | 'right' | 'bottom' | 'left' | 'top-right' | null => {
  if (shape === "l-shape" || shape === "custom") {
    // L-shape and Custom have 6 edges: map each to a cardinal direction
    if (edgeIndex === 0) return 'top'     // Top edge
    if (edgeIndex === 1) return 'right'   // Right edge (upper part)
    if (edgeIndex === 2) return 'bottom'  // Inner Horizontal edge
    if (edgeIndex === 3) return 'right'   // Inner Vertical edge
    if (edgeIndex === 4) return 'bottom'  // Bottom edge
    if (edgeIndex === 5) return 'left'    // Left edge
    return 'right' // Fallback
  }
  if (shape === "u-shape") {
    // U-shape has 5 edges: map each to a cardinal direction
    if (edgeIndex === 0) return 'top'     // Top edge (left part)
    if (edgeIndex === 1) return 'top-right' // Top edge (diagonal)
    if (edgeIndex === 2) return 'right'   // Right edge
    if (edgeIndex === 3) return 'bottom'  // Bottom edge
    if (edgeIndex === 4) return 'left'    // Left edge
    return 'right' // Fallback
  }
  // Default for square/rectangle/open-l (4 sides)
  if (edgeIndex === 0) return 'top'
  if (edgeIndex === 1) return 'right'
  if (edgeIndex === 2) return 'bottom'
  if (edgeIndex === 3) return 'left'
  return 'top' // Fallback
}

const getCornerResizeDirection = (shape: string, cornerIndex: number): 'tl' | 'tr' | 'br' | 'bl' | null => {
  if (shape === "l-shape" || shape === "custom") {
    // L-shape and Custom have 6 corners
    if (cornerIndex === 0) return 'tl'  // Top-left corner
    if (cornerIndex === 1) return 'tr'  // Top-right corner
    if (cornerIndex === 2) return 'tr'  // Inner corner (treat as top-right)
    if (cornerIndex === 3) return 'br'  // Inner corner (treat as bottom-right)
    if (cornerIndex === 4) return 'br'  // Bottom-right
    if (cornerIndex === 5) return 'bl'  // Bottom-left corner
    return 'tl' // Fallback
  }
  if (shape === "u-shape") {
    // U-shape has 5 corners
    if (cornerIndex === 0) return 'tl'  // Top-left corner
    if (cornerIndex === 1) return 'tr'  // Top inner corner
    if (cornerIndex === 2) return 'tr'  // Top-right corner
    if (cornerIndex === 3) return 'br'  // Bottom-right corner
    if (cornerIndex === 4) return 'bl'  // Bottom-left corner
    return 'tl' // Fallback
  }
  // Default for square/rectangle/open-l (4 corners)
  if (cornerIndex === 0) return 'tl'
  if (cornerIndex === 1) return 'tr'
  if (cornerIndex === 2) return 'br'
  if (cornerIndex === 3) return 'bl'
  return 'tl' // Fallback
}
