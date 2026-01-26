"use client"

import { useEffect } from "react"

interface WallCursorProps {
  enabled: boolean
  targetRef: React.RefObject<HTMLElement | null>
}

export default function WallCursor({ enabled, targetRef }: WallCursorProps) {
  useEffect(() => {
    const target = targetRef?.current
    if (!target) return

    // Small pencil SVG — URL-encoded
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path fill='%230051BA' d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/></svg>`
    const encoded = encodeURIComponent(svg)
    const dataUrl = `data:image/svg+xml;utf8,${encoded}`

    const prevCursor = (target.style && target.style.cursor) || ""

    if (enabled) {
      try {
        // hotspot at center (12 12)
        target.style.cursor = `url("${dataUrl}") 12 12, crosshair`
      } catch (e) {
        // Fallback
        target.style.cursor = "crosshair"
      }
    } else {
      target.style.cursor = prevCursor || ""
    }

    return () => {
      // restore previous cursor
      target.style.cursor = prevCursor || ""
    }
  }, [enabled, targetRef])

  return null
}
