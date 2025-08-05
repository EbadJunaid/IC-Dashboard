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
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 md:p-4 text-white w-full shadow-2xl">
      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
        <h3 className="text-xs sm:text-sm md:text-base font-medium text-slate-300 leading-tight">
          Cycle Burn Rate
        </h3>
        <div className="flex-shrink-0">
          <HelpTooltip content="The rate at which cycles are consumed by the Internet Computer network for computation and storage, measured in TCYCLES per second." />
        </div>
      </div>
      
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-baseline space-x-1 sm:space-x-2 flex-wrap">
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white font-mono leading-none">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              <span className="transition-all duration-500 ease-out break-all">
                {formattedValue}
              </span>
            )}
          </span>
          <span className="text-xs sm:text-sm text-slate-300 flex-shrink-0">
            TCYCLES/s
          </span>
        </div>
      </div>
    </div>
  )
}