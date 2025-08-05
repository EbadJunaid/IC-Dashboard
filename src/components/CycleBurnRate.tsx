"use client"
import { HelpTooltip } from "./HelpTooltip"

interface CycleBurnRateProps {
  tcyclesPerSecond: number
  loading?: boolean
}

export function CycleBurnRate({ tcyclesPerSecond, loading = false }: CycleBurnRateProps) {
  // Format the number to show 6 decimal places for better visibility
  const formattedValue = tcyclesPerSecond > 0 ? tcyclesPerSecond.toFixed(6) : "0.000000"

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-3 md:p-4 text-white w-full max-w-sm shadow-2xl">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm md:text-base font-medium text-slate-300">Cycle Burn Rate</h3>
        <HelpTooltip content="The rate at which cycles are consumed by the Internet Computer network for computation and storage, measured in TCYCLES per second." />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white font-mono">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              <span className="transition-all duration-500 ease-out">{formattedValue}</span>
            )}
          </span>
          <span className="text-xs md:text-sm text-slate-300">TCYCLES/s</span>
        </div>
      </div>
    </div>
  )
}
