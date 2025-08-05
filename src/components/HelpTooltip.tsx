"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { HelpCircle } from "lucide-react"
import { createPortal } from "react-dom"

interface HelpTooltipProps {
  content: string
  className?: string
}

const shortTexts = {
  "ETH-equivalent transactions represent the number of Ethereum transactions that would consume the same amount of computational resources as the current IC network activity.":
    "ETH-equivalent TX rate based on computational resources consumed by IC network.",
  "The total number of messages being executed per second across all subnets in the Internet Computer network.":
    "Messages executed per second across all IC subnets.",
  "Million Instructions Executed Per Second (MIPS) measures the computational throughput of the Internet Computer network.":
    "Computational throughput measured in Million Instructions Per Second.",
  "The rate at which cycles are consumed by the Internet Computer network for computation and storage, measured in TCYCLES per second.":
    "Rate of cycle consumption for computation and storage (TCYCLES/s).",
}

export function HelpTooltip({ content, className = "" }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, placement: "top" as "top" | "bottom" })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)

  // Use shorter text if available
  const displayContent = shortTexts[content as keyof typeof shortTexts] || content

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isVisible && buttonRef.current && mounted) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const tooltipWidth = 200
      const tooltipHeight = 80

      let left = buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2
      let top = buttonRect.top - tooltipHeight - 8
      let placement: "top" | "bottom" = "top"

      // Adjust horizontal position if tooltip would overflow
      if (left < 8) {
        left = 8
      } else if (left + tooltipWidth > windowWidth - 8) {
        left = windowWidth - tooltipWidth - 8
      }

      // If tooltip would overflow at top, show it below
      if (top < 8) {
        top = buttonRect.bottom + 8
        placement = "bottom"
      }

      setPosition({ top, left, placement })
    }
  }, [isVisible, mounted])

  const handleMouseEnter = () => {
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsVisible(!isVisible)
  }

  const tooltipContent =
    isVisible && mounted ? (
      <div
        className="fixed z-[99999] w-48 p-3 bg-slate-900/98 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl text-xs text-white"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          maxWidth: "200px",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Arrow */}
        <div
          className={`absolute w-2 h-2 bg-slate-900 border border-slate-600 transform rotate-45 ${
            position.placement === "top" ? "bottom-[-5px] border-t-0 border-l-0" : "top-[-5px] border-b-0 border-r-0"
          }`}
          style={{
            left: "50%",
            transform: `translateX(-50%) rotate(45deg)`,
          }}
        />
        <div className="leading-relaxed text-gray-100">{displayContent}</div>
      </div>
    ) : null

  return (
    <>
      <button
        ref={buttonRef}
        className={`text-gray-400 hover:text-white transition-colors z-10 ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        type="button"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Portal the tooltip to document.body to avoid positioning issues */}
      {mounted && tooltipContent && createPortal(tooltipContent, document.body)}

      {/* Mobile backdrop */}
      {isVisible && mounted && <div className="fixed inset-0 z-[9998] md:hidden" onClick={() => setIsVisible(false)} />}
    </>
  )
}
