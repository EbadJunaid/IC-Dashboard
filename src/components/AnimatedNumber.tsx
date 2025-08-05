"use client"

import { useState, useEffect } from "react"

interface AnimatedNumberProps {
  value: number
  className?: string
  duration?: number
  formatNumber?: boolean
}

export function AnimatedNumber({ value, className = "", duration = 500, formatNumber = true }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (displayValue !== value) {
      setIsAnimating(true)
      const startValue = displayValue
      const difference = value - startValue
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Simple easing function
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)

        const currentValue = Math.floor(startValue + difference * easeOutCubic)
        setDisplayValue(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setDisplayValue(value)
          setIsAnimating(false)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [value, displayValue, duration])

  const formatValue = (num: number) => {
    if (!formatNumber) return num.toString()
    return num.toLocaleString()
  }

  return (
    <span className={`${className} ${isAnimating ? "text-blue-400 transition-colors duration-200" : ""}`}>
      {formatValue(displayValue)}
    </span>
  )
}
