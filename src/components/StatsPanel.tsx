"use client"

import type { MetricsData } from "@/types"

function CountryFlag({ countryCode, className = "w-4 h-3" }: { countryCode: string; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
      alt={`${countryCode} flag`}
      className={`${className} object-cover flex-shrink-0 rounded-sm`}
      onError={(e) => {
        e.currentTarget.style.display = "none"
      }}
    />
  )
}

interface StatsPanelProps {
  metrics: MetricsData
  loading: boolean
  topCountries: string[]
}

export function StatsPanel({ metrics, loading, topCountries }: StatsPanelProps) {
  return (
    <div className="w-full h-full">
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-3 md:p-4 lg:p-6 text-white h-full flex flex-col shadow-2x1">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-sm md:text-base lg:text-lg font-semibold">Decentralization</h2>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-400 rounded-full"></div>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-400 rounded-full"></div>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-400 rounded-full"></div>
          </div>
        </div>

        <div className="mb-3 md:mb-4">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <span className="text-xs md:text-sm text-slate-300">All subnets →</span>
            <span className="text-xs md:text-sm text-emerald-400">+1  7</span>
          </div>
          <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1">
            {loading ? "..." : metrics.totalSubnets}
          </div>
          <div className="text-xs md:text-sm text-slate-300">
            Subnets in {loading ? "..." : metrics.totalCountries} Countries
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4 flex-1">
          <div className="bg-slate-800/50 rounded-lg p-2 md:p-3 flex flex-col justify-center min-h-[50px] md:min-h-[70px]">
            <div className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold">
              {loading ? "..." : metrics.totalNodes}
            </div>
            <div className="text-xs text-slate-3  00">Node Machines</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 md:p-3 flex flex-col justify-center min-h-[50px] md:min-h-[70px]">
            <div className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold">
              {loading ? "..." : metrics.totalNodeProviders}
            </div>
            <div className="text-xs text-slate-300">Node Providers</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 md:p-3 flex flex-col justify-center min-h-[50px] md:min-h-[70px]">
            <div className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold">
              {loading ? "..." : metrics.totalDataCenters}
            </div>
            <div className="text-xs text-slate-300">Data Centers</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 md:p-3 flex flex-col justify-center min-h-[50px] md:min-h-[70px]">
            <div className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold">
              {loading ? "..." : metrics.totalRegions}
            </div>
            <div className="text-xs text-slate-300">Regions</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2 md:p-3 flex flex-col justify-center min-h-[50px] md:min-h-[70px] col-span-2">
            <div className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold">
              {loading ? "..." : metrics.totalDCOwners}
            </div>
            <div className="text-xs text-slate-300">DC Owners</div>
          </div>
        </div>

        <div className="border-t border-slate-600 pt-2 md:pt-3 mt-auto">
          <div className="text-xs md:text-sm text-slate-300 mb-2 md:mb-3">Top Countries</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-1 md:gap-2 overflow-x-auto flex-nowrap"
               style={{ overflowX: "auto", display: "flex" }}>
            {topCountries.map((country) => (
              <div
                key={country}
                className="flex items-center space-x-1 md:space-x-1.5 bg-slate-800/50 rounded-md px-1.5 md:px-2 py-1 md:py-1.5 min-w-0 hover:bg-slate-700/30 transition-colors cursor-pointer"
                style={{ minWidth: 70, flex: "0 0 auto" }}
              >
                <CountryFlag countryCode={country} className="w-3 h-2 md:w-4 md:h-3 flex-shrink-0" />
                <span className="text-xs text-slate-300 uppercase truncate">{country}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}