"use client"

import { AnimatedNumber } from "./AnimatedNumber"
import { HelpTooltip } from "./HelpTooltip"

interface MetricCardProps {
  title: string
  value: number
  unit: string
  helpText: string
  loading?: boolean
  className?: string
}

export function MetricCard({ title, value, unit, helpText, loading = false, className = "" }: MetricCardProps) {
  return (
    <div
      className={`bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-3 md:p-4 lg:p-6 text-white shadow-2xl ${className}`}
    >
      <div className="flex items-start mb-2 md:mb-3">
        <h3 className="text-xs md:text-sm lg:text-base font-medium text-slate-300 leading-tight mr-3">{title}</h3>
        <HelpTooltip content={helpText} />
      </div>

      <div className="flex items-baseline space-x-1">
        <div className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold">
          {loading ? (
            <span className="animate-pulse">...</span>
          ) : (
            <AnimatedNumber value={value} className="text-white" />
          )}
        </div>
        <div className="text-xs md:text-sm lg:text-base text-slate-400">{unit}</div>
      </div>
    </div>
  )
}
