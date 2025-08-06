"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface AnimatedNumberProps {
  value: number
  className?: string
  duration?: number
  formatNumber?: boolean
}

export function AnimatedNumber({ 
  value, 
  className = "", 
  duration = 500, 
  formatNumber = true 
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number>()
  const previousValue = useRef(value)

  const formatValue = useCallback((num: number) => {
    if (!formatNumber) return num.toString()
    return num.toLocaleString()
  }, [formatNumber])

  useEffect(() => {
    // Only animate if value actually changed
    if (previousValue.current === value) return
    
    previousValue.current = value
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
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
        setIsAnimating(false)
        animationRef.current = undefined
      }
    }

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    animationRef.current = requestAnimationFrame(animate)

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }
  }, [value, duration]) // Removed displayValue from dependencies

  // Initialize displayValue on mount
  useEffect(() => {
    setDisplayValue(value)
  }, []) // Empty dependency array for mount only

  return (
    <span className={`${className} ${isAnimating ? "text-blue-400 transition-colors duration-200" : ""}`}>
      {formatValue(displayValue)}
    </span>
  )
}