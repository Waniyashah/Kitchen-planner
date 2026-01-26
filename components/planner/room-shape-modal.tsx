"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { usePlannerStore, type RoomShape } from "@/lib/planner-store"
import { X, Check } from "lucide-react"

const ROOM_SHAPES: {
    id: RoomShape
    label: string
    category: "enclosed" | "open"
    preview: React.ReactNode
}[] = [
        {
            id: "square",
            label: "Standard Enclosed",
            category: "enclosed",
            preview: (
                <svg viewBox="10 10 80 80" className="h-full w-full">
                    <rect x="15" y="15" width="70" height="70" fill="currentColor" stroke="#111" strokeWidth="2" />
                </svg>
            ),
        },
        {
            id: "l-shape",
            label: "L-Shape Enclosed",
            category: "enclosed",
            preview: (
                <svg viewBox="10 10 80 80" className="h-full w-full">
                    <path d="M 15 15 L 65 15 L 65 35 L 85 35 L 85 85 L 15 85 Z" fill="currentColor" stroke="#111" strokeWidth="2" />
                </svg>
            ),
        },
        {
            id: "u-shape",
            label: "Corner Cut Enclosed",
            category: "enclosed",
            preview: (
                <svg viewBox="10 10 80 80" className="h-full w-full">
                    <path d="M 15 15 L 75 15 L 85 25 L 85 85 L 15 85 Z" fill="currentColor" stroke="#111" strokeWidth="2" />
                </svg>
            ),
        },
        {
            id: "open-l",
            label: "Open rectangular layout",
            category: "open",
            preview: (
                <svg viewBox="10 10 80 80" className="h-full w-full">
                    <rect x="15" y="15" width="70" height="70" fill="none" stroke="#111" strokeWidth="2" />
                    <line x1="15" y1="38" x2="85" y2="38" stroke="#111" strokeWidth="2" strokeDasharray="4,4" />
                </svg>
            ),
        },
        {
            id: "rectangle",
            label: "Vertically divided layout",
            category: "open",
            preview: (
                <svg viewBox="10 10 80 80" className="h-full w-full">
                    <rect x="15" y="15" width="70" height="70" fill="none" stroke="#111" strokeWidth="2" />
                    <line x1="15" y1="45" x2="45" y2="45" stroke="#111" strokeWidth="2" strokeDasharray="4,4" />
                    <line x1="45" y1="15" x2="45" y2="45" stroke="#111" strokeWidth="2" strokeDasharray="4,4" />
                </svg>
            ),
        },
        {
            id: "custom",
            label: "L-shaped combined space",
            category: "open",
            preview: (
                <svg viewBox="10 10 100 100" className="h-full w-full">
                    <path d="M 15 15 L 105 15 L 105 50 L 70 50 L 70 105 L 15 105 Z" fill="none" stroke="#111" strokeWidth="2" />
                    <line x1="15" y1="50" x2="105" y2="50" stroke="#111" strokeWidth="2" strokeDasharray="4,4" />
                </svg>
            ),
        },
    ]

export function RoomShapeModal() {
    const { setShowRoomShapeModal, setShowSuggestionsModal, setRoom, room, placedItems, waterSupplies, clearAllItems } =
        usePlannerStore()
    const [selectedShape, setSelectedShape] = React.useState<RoomShape | null>(room?.shape || null)
    const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)
    const [pendingShape, setPendingShape] = React.useState<RoomShape | null>(null)

    const handleShapeSelect = (shape: RoomShape) => {
        const hasExistingFloorPlan = room !== null && (placedItems.length > 0 || waterSupplies.length > 0)

        if (hasExistingFloorPlan && room?.shape !== shape) {
            setPendingShape(shape)
            setShowConfirmDialog(true)
        } else {
            applyShapeChange(shape, false)
        }
    }

    const applyShapeChange = (shape: RoomShape, keepItems = false) => {
        console.debug("[RoomShapeModal] applyShapeChange", { shape, keepItems })
        setSelectedShape(shape)

        if (keepItems) {
            setRoom({
                ...room!,
                shape,
            })
        } else {
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
        }

        // After updating the room, force a resize event shortly so the canvas can
        // re-measure and redraw immediately (fixes the issue where the shape only
        // appears after a manual resize / opening devtools).
        setTimeout(() => {
            try {
                window.dispatchEvent(new Event("resize"))
            } catch (e) {
                // ignore
            }
        }, 50)

        // Close the shape modal and re-open the suggestions modal after a short delay
        // so the canvas has a chance to render the updated room before the overlay appears.
        setShowRoomShapeModal(false)
        console.debug("[RoomShapeModal] closed shape modal, will open suggestions in 150ms")
        setTimeout(() => {
            console.debug("[RoomShapeModal] opening suggestions modal")
            setShowSuggestionsModal(true)
        }, 150)
    }

    const handleConfirmOverwrite = () => {
        if (pendingShape) {
            clearAllItems()
            applyShapeChange(pendingShape, false)
            setShowConfirmDialog(false)
            setPendingShape(null)
        }
    }

    const handleKeepChanges = () => {
        if (pendingShape) {
            applyShapeChange(pendingShape, true)
            setShowConfirmDialog(false)
            setPendingShape(null)
        }
    }

    const enclosedShapes = ROOM_SHAPES.filter((s) => s.category === "enclosed")
    const openShapes = ROOM_SHAPES.filter((s) => s.category === "open")

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative w-full max-w-6xl rounded-lg bg-white shadow-xl max-h-[95vh] overflow-y-auto">
                <div className="px-6 py-5">
                    <h2 className="text-2xl font-bold text-[#111]">Choose Room Shape</h2>
                    <p className="mt-1 text-sm text-[#484848]">
                        Select a Shape to change your Floor Plan to this new shape. You can adapt it later
                    </p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => setShowRoomShapeModal(false)}
                    className="absolute top-2 right-2 h-auto w-auto p-2"
                >
                    <X className="size-8" strokeWidth={2.5} />
                </Button>

                <div className="px-48 pb-12">
                    <div className="mb-10">
                        <h3 className="mb-4 text-base font-semibold text-[#111]">Enclosed Kitchen Space</h3>
                        <div className="grid grid-cols-3 gap-6">
                            {enclosedShapes.map((shape) => (
                                <button
                                    key={shape.id}
                                    onClick={() => handleShapeSelect(shape.id)}
                                    className={`group relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 p-2 transition-all ${selectedShape === shape.id
                                        ? "border-[#0051BA] bg-[#e8f1fc]"
                                        : "border-[#dfdfdf] hover:border-[#0051BA]"
                                        }`}
                                >
                                    <div
                                        className={`relative h-32 w-full ${selectedShape === shape.id ? "text-[#0051BA]" : "text-[#e0e0e0]"}`}
                                    >
                                        {shape.preview}
                                    </div>
                                    {selectedShape === shape.id && (
                                        <div className="absolute bottom-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-[#0051BA]">
                                            <Check className="h-5 w-5 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 text-base font-semibold text-[#111]">Open Kitchen Space</h3>
                        <div className="grid grid-cols-3 gap-6">
                            {openShapes.map((shape) => (
                                <button
                                    key={shape.id}
                                    onClick={() => handleShapeSelect(shape.id)}
                                    className={`group relative flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all ${selectedShape === shape.id
                                        ? "border-[#0051BA] bg-[#e8f1fc]"
                                        : "border-[#dfdfdf] hover:border-[#0051BA]"
                                        }`}
                                >
                                    <div
                                        className={`relative h-28 w-full flex items-center justify-center ${selectedShape === shape.id ? "text-[#0051BA]" : "text-[#e0e0e0]"}`}
                                    >
                                        {shape.preview}
                                    </div>
                                    <span className="text-xs text-center text-[#484848] font-medium">{shape.label}</span>
                                    {selectedShape === shape.id && (
                                        <div className="absolute bottom-2 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-[#0051BA]">
                                            <Check className="h-5 w-5 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {showConfirmDialog && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
                    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-[#111]">Change room shape</h3>
                        </div>

                        <div className="mb-8 space-y-3">
                            <p className="text-sm text-[#484848] leading-relaxed">
                                The room shape you selected will replace the previous floorplan you created
                            </p>
                            <p className="text-sm font-semibold text-[#111]">Do you want to overwrite your previous floorplan?</p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleKeepChanges}
                                className="flex-1 border-[#dfdfdf] hover:bg-[#f5f5f5] bg-transparent"
                            >
                                No
                            </Button>
                            <Button onClick={handleConfirmOverwrite} className="flex-1 bg-[#0051BA] hover:bg-[#003d8f]">
                                Overwrite
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
