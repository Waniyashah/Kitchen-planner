"use client"

import { Button } from "@/components/ui/button"
import { usePlannerStore } from "@/lib/planner-store"

export function SuggestionsModal() {
  const { setShowSuggestionsModal } = usePlannerStore()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-center text-xl font-semibold">Are you want to start from scratch?</h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          We can provide you several Kitchen layout suggestions to customise if you prefer
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => {
              setShowSuggestionsModal(false)
              // TODO: Show suggestions
            }}
          >
            See Suggestions
          </Button>
          <Button className="flex-1" onClick={() => setShowSuggestionsModal(false)}>
            Continue from Scratch
          </Button>
        </div>
      </div>
    </div>
  )
}
