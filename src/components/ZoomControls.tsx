"use client"

import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
}

export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 z-10">
      <Button
        variant="outline"
        size="icon"
        onClick={onZoomIn}
        className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 w-8 h-8 md:w-10 md:h-10"
      >
        <Plus className="w-3 h-3 md:w-4 md:h-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onZoomOut}
        className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 w-8 h-8 md:w-10 md:h-10"
      >
        <Minus className="w-3 h-3 md:w-4 md:h-4" />
      </Button>
    </div>
  )
}
