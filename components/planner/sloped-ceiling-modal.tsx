"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Trash2, X } from "lucide-react"
import { usePlannerStore, SlopedCeiling } from "@/lib/planner-store"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface SlopedCeilingModalProps {
  visible: boolean
  onCancel: () => void
  onOk: () => void
  onUndo: () => void
  onRedo: () => void
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onCanvasMount?: (element: HTMLCanvasElement | null) => void
  onMouseDown?: (e: React.MouseEvent<HTMLCanvasElement>) => void
  onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void
  onMouseUp?: (e: React.MouseEvent<HTMLCanvasElement>) => void
  selectedWallId: string | null
  onCloseSidebar: () => void
}

export default function SlopedCeilingModal({
  visible,
  onCancel,
  onOk,
  onUndo,
  onRedo,
  canvasRef,
  onCanvasMount,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  selectedWallId,
  onCloseSidebar
}: SlopedCeilingModalProps) {
  const { slopedCeilings, addSlopedCeiling, updateSlopedCeiling, removeSlopedCeiling } = usePlannerStore()
  const [showSchema, setShowSchema] = useState(true)
  
  // Local state for inputs to avoid jitter, synced with store
  const [localValues, setLocalValues] = useState<{ a: number; b: number; c: number }>({ a: 0, b: 0, c: 0 })

  const currentSlopedCeiling = selectedWallId 
    ? slopedCeilings.find(sc => sc.wallId === selectedWallId) 
    : null

  useEffect(() => {
    if (currentSlopedCeiling) {
      setLocalValues({
        a: currentSlopedCeiling.a,
        b: currentSlopedCeiling.b,
        c: currentSlopedCeiling.c
      })
    } else {
      // Default values
      setLocalValues({ a: 1300, b: 1400, c: 0 })
    }
  }, [currentSlopedCeiling, selectedWallId])

  const handleValueChange = (key: 'a' | 'b' | 'c', value: string) => {
    const numValue = parseInt(value) || 0
    setLocalValues(prev => ({ ...prev, [key]: numValue }))
    
    if (selectedWallId) {
      if (currentSlopedCeiling) {
        updateSlopedCeiling(currentSlopedCeiling.id, { [key]: numValue })
      } else {
        // Create new if not exists
        addSlopedCeiling({
          id: Math.random().toString(36).substr(2, 9),
          wallId: selectedWallId,
          a: key === 'a' ? numValue : localValues.a,
          b: key === 'b' ? numValue : localValues.b,
          c: key === 'c' ? numValue : localValues.c,
        })
      }
    }
  }

  const handleRemove = () => {
    if (currentSlopedCeiling) {
      removeSlopedCeiling(currentSlopedCeiling.id)
    }
    onCloseSidebar()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-6xl h-[80vh] rounded-lg bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add sloped ceiling</h2>
            <p className="text-sm text-gray-600">
              Select a wall to start your sloped ceiling then enter your desired measurements to create it.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onUndo} className="rounded-md p-2 hover:bg-gray-50" title="Undo">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button onClick={onRedo} className="rounded-md p-2 hover:bg-gray-50" title="Redo">
              <ArrowRight className="h-5 w-5 text-gray-700" />
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={onOk}>
              Ok
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar */}
          {selectedWallId && (
            <div className="w-80 border-r border-gray-200 bg-white p-4 flex flex-col overflow-y-auto z-10 shadow-none h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Sloped ceiling</h3>
                <button 
                  onClick={() => setShowSchema(!showSchema)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {showSchema ? "Hide sloped ceiling" : "Show schema"}
                </button>
              </div>

              {showSchema && (
                <div className="mb-6 border rounded-lg p-4 bg-white flex justify-center">
                  {/* SVG Diagram representing the slope */}
                  <svg width="200" height="160" viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                        <path d="M0 0 L10 5 L0 10 Z" fill="#374151" />
                      </marker>
                      <marker id="arrow-start" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">
                        <path d="M0 0 L10 5 L0 10 Z" fill="#374151" />
                      </marker>
                    </defs>

                    {/* Back Wall (Inner) */}
                    <path d="M60 50 L100 50 L130 80 L130 110 L60 110 Z" stroke="#e5e7eb" strokeWidth="2" fill="none"/>
                    
                    {/* Connectors */}
                    <path d="M30 30 L60 50" stroke="#e5e7eb" strokeWidth="2"/>
                    <path d="M30 130 L60 110" stroke="#e5e7eb" strokeWidth="2"/>
                    <path d="M170 130 L130 110" stroke="#e5e7eb" strokeWidth="2"/>
                    <path d="M170 80 L130 80" stroke="#e5e7eb" strokeWidth="2"/>
                    <path d="M120 30 L100 50" stroke="#e5e7eb" strokeWidth="2"/>

                    {/* Front Outline */}
                    <path d="M30 30 L120 30 L170 80 L170 130 L30 130 Z" stroke="#d1d5db" strokeWidth="2" fill="none"/>
                    
                    {/* Window (Left Wall) */}
                    <path d="M35 50 L50 60 L50 90 L35 100 Z" fill="#e0f2fe"/>

                    {/* Slope Fill (Blue) */}
                    <path d="M120 30 L170 80 L130 80 L100 50 Z" fill="#7dd3fc" fillOpacity="0.8" stroke="#0ea5e9"/>

                    {/* Dotted Vertical Line (Projection of slope start) */}
                    <path d="M120 30 L120 130" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 2"/>
                    
                    {/* Dimension A (Height of Knee Wall) */}
                    <line x1="185" y1="80" x2="185" y2="130" stroke="#374151" strokeWidth="1.5" markerStart="url(#arrow-start)" markerEnd="url(#arrow)"/>
                    <text x="195" y="110" fontFamily="sans-serif" fontSize="14" fill="#374151">A</text>

                    {/* Dimension B (Width of Slope) */}
                    <line x1="120" y1="145" x2="170" y2="145" stroke="#374151" strokeWidth="1.5" markerStart="url(#arrow-start)" markerEnd="url(#arrow)"/>
                    <text x="140" y="165" fontFamily="sans-serif" fontSize="14" fill="#374151">B</text>

                    {/* Label C */}
                    <circle cx="170" cy="80" r="3" fill="white" stroke="#374151" strokeWidth="1.5"/>
                    <line x1="172" y1="78" x2="190" y2="60" stroke="#374151" strokeWidth="1.5"/>
                    <text x="192" y="55" fontFamily="sans-serif" fontSize="14" fill="#374151">C</text>
                  </svg>
                </div>
              )}

              <div className="space-y-6 flex-1 pr-2">
                {/* Input A */}
                <div className="flex items-center gap-4">
                  <div className="w-8 flex justify-end">
                    <Label htmlFor="dim-a" className="font-medium text-gray-700">A</Label>
                  </div>
                  <div className="flex-1 relative">
                    <Input 
                      id="dim-a" 
                      value={localValues.a} 
                      onChange={(e) => handleValueChange('a', e.target.value)}
                      className="pr-8 h-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">mm</span>
                  </div>
                </div>

                {/* Input B */}
                <div className="flex items-center gap-4 relative">
                  <div className="w-8 flex items-center justify-end gap-2">
                     <input type="radio" checked readOnly className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                     <Label htmlFor="dim-b" className="font-medium text-gray-700">B</Label>
                  </div>
                  <div className="flex-1 relative">
                    <Input 
                      id="dim-b" 
                      value={localValues.b} 
                      onChange={(e) => handleValueChange('b', e.target.value)}
                      className="pr-8 h-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">mm</span>
                  </div>
                  
                  {/* Bracket connecting B and C */}
                  <div className="absolute right-[-10px] top-[20px] w-4 h-[60px] border-r border-t border-b border-gray-300 rounded-r-sm pointer-events-none"></div>
                </div>

                {/* Input C */}
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-end gap-2">
                     <input type="radio" disabled className="w-4 h-4 text-gray-300 border-gray-300" />
                     <Label htmlFor="dim-c" className="font-medium text-gray-400">C</Label>
                  </div>
                  <div className="flex-1 relative">
                    <Input 
                      id="dim-c" 
                      value={localValues.c} 
                      onChange={(e) => handleValueChange('c', e.target.value)}
                      className="pr-8 h-10 bg-gray-50 text-gray-400"
                      disabled
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">°</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 border-gray-300"
                  onClick={handleRemove}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Canvas Container */}
          <div className="flex-1 relative bg-gray-100">
             <canvas 
                ref={(el) => {
                  if (canvasRef) {
                    (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el;
                  }
                  if (onCanvasMount) {
                    onCanvasMount(el);
                  }
                }}
                className="h-full w-full block"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                style={{
                  cursor: 'default',
                  userSelect: 'none'
                }}
              />
          </div>
        </div>
      </div>
    </div>
  )
}
