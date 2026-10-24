"use client"

import type React from "react"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePlannerStore } from "@/lib/planner-store"
import { FileEdit, ClipboardList, RotateCw, Undo2, Redo2, Save, X } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface PlannerHeaderProps {
  activeStep?: "define" | "favourite" | "make-it-yours" | "final"
}

export function PlannerHeader({ activeStep = "define" }: PlannerHeaderProps) {
  const router = useRouter()
  const { undo, redo, history, historyIndex, exportJSON, loadFromJSON, exportPNG, room } = usePlannerStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleExportJSON = () => {
    const json = exportJSON()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kitchen-plan-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Plan exported",
      description: "Your kitchen plan has been saved as JSON.",
    })
  }

  const handleExportPNG = () => {
    // Get canvas from the planner canvas component
    const canvas = document.querySelector("canvas")
    if (canvas) {
      exportPNG(canvas)
      toast({
        title: "Image exported",
        description: "Your kitchen plan has been saved as PNG.",
      })
    } else {
      toast({
        title: "Export failed",
        description: "Could not find canvas to export.",
        variant: "destructive",
      })
    }
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const json = event.target?.result as string
      loadFromJSON(json)
      toast({
        title: "Plan loaded",
        description: "Your kitchen plan has been loaded successfully.",
      })
    }
    reader.readAsText(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = () => {
    // Data is auto-saved to localStorage via zustand persist
    toast({
      title: "Plan saved",
      description: "Your kitchen plan has been saved locally.",
    })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#dfdfdf] bg-white px-4 sm:px-6 overflow-x-auto min-w-0">
      <div className="flex items-center gap-6 sm:gap-10 lg:gap-16 flex-shrink-0">
        <Link href="/" className="flex items-center h-12 flex-shrink-0" title="Back to Home">
          <Image
            src="/kitchen-by-wasa-logo.png"
            alt="Kitchen by Wasa"
            width={105}
            height={45}
            className="object-contain cursor-pointer"
          />
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/define" className={`pb-3 pt-3 ${activeStep === "define" ? "border-b-2 border-[#0051BA]" : ""}`}>
            <span className={`text-sm sm:text-base cursor-pointer hover:text-[#0051BA] whitespace-nowrap ${activeStep === "define" ? "font-extrabold text-black" : "font-bold text-black"}`}>
              Define your space
            </span>
          </Link>
          <Link href="/summary" className={`pb-3 pt-3 ${activeStep === "favourite" ? "border-b-2 border-[#0051BA]" : ""}`}>
            <span className={`text-sm sm:text-base cursor-pointer hover:text-[#0051BA] whitespace-nowrap ${activeStep === "favourite" ? "font-extrabold text-black" : "font-bold text-black"}`}>
              Choose a favourite
            </span>
          </Link>
          <Link href="/make-it-yours" className={`pb-3 pt-3 ${activeStep === "make-it-yours" ? "border-b-2 border-[#0051BA]" : ""}`}>
            <span className={`text-sm sm:text-base cursor-pointer hover:text-[#0051BA] whitespace-nowrap ${activeStep === "make-it-yours" ? "font-extrabold text-black" : "font-bold text-black"}`}>
              Make it yours
            </span>
          </Link>
          <Link href="/checkout" className={`pb-3 pt-3 ${activeStep === "final" ? "border-b-2 border-[#0051BA]" : ""}`}>
            <span className={`text-sm sm:text-base cursor-pointer hover:text-[#0051BA] whitespace-nowrap ${activeStep === "final" ? "font-extrabold text-black" : "font-bold text-black"}`}>
              Make it happen
            </span>
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-4">
        <div className="hidden sm:flex items-center gap-1 border-r border-[#dfdfdf] pr-3 sm:pr-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-[#111] hover:bg-[#f5f5f5] hover:text-[#0051BA]"
            title="Edit project details"
          >
            <FileEdit className="size-[22px] sm:size-[25px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-[#111] hover:bg-[#f5f5f5] hover:text-[#0051BA]"
            title="Project checklist"
          >
            <ClipboardList className="size-[22px] sm:size-[25px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-[#111] hover:bg-[#f5f5f5] hover:text-[#0051BA]"
            title="Refresh view"
          >
            <RotateCw className="size-[22px] sm:size-[25px]" />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-r border-[#dfdfdf] pr-3 sm:pr-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-[#111] hover:bg-[#f5f5f5] hover:text-[#0051BA] disabled:opacity-40"
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
          >
            <Undo2 className="size-[22px] sm:size-[25px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-[#111] hover:bg-[#f5f5f5] hover:text-[#0051BA] disabled:opacity-40"
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
          >
            <Redo2 className="size-[22px] sm:size-[25px]" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-[#111] hover:bg-[#f5f5f5] hover:text-[#0051BA]"
            onClick={handleSave}
            title="Save project"
          >
            <Save className="size-[22px] sm:size-[25px]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-[#111] hover:bg-[#f5f5f5] hover:text-[#0051BA]"
            onClick={() => router.push("/")}
            title="Exit planner to home"
          >
            <X className="size-[22px] sm:size-[25px]" />
          </Button>
        </div>
      </div>
    </header>
  )
}
