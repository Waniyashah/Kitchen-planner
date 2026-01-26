"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface AddWallModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onCanvasMount?: (element: HTMLCanvasElement | null) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  title?: string;
  description?: string;
}

export default function AddWallModal({
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
  title = "Add a wall",
  description = "Click to start a wall, click again to finish it. Press ESC to cancel."
}: AddWallModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      {/* Modal Container */}
      <div className="w-full max-w-6xl h-[80vh] rounded-lg bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">
              {description}
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
                  cursor: `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%230051BA" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>')}") 12 12, crosshair`,
                  userSelect: 'none'
                }}
              />
              {/* Scale Bar (Bottom Center) */}
              <div className="absolute bottom-4 left-1/2 h-1 w-24 -translate-x-1/2 bg-gray-400"></div>
          </div>
        </div>
      </div>
    </div>
  )
}