"use client"

import type { MetricsData } from "@/types"
import Image from "next/image"

function CountryFlag({ countryCode, className = "w-4 h-3" }: { countryCode: string; className?: string }) {
  return (
    <Image
      src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
      alt={`${countryCode} flag`}
      width={20}
      height={15}
      className={`${className} object-cover flex-shrink-0 rounded-sm`}
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
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="bg-[#231a3a] border border-slate-700 rounded-2xl p-4 text-white 
        w-full                    /* Full width on all screens */
        sm:w-full                 /* Full width on small screens */
        md:w-full                 /* Full width on medium screens (fixes zoom 110%, 125%) */
        lg:w-full                 /* Full width on large screens */
        xl:w-96 xl:max-w-[400px]  /* Constrained width only on xl screens */
        min-h-[350px] h-full flex flex-col mx-1 sm:mx-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Decentralization</h2>
          <div className="flex space-x-2">
            <button className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 transition">
              <span className="sr-only">Previous</span>
              <svg width="14" height="14" fill="none">
                <path d="M9 3l-4 4 4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 transition">
              <span className="sr-only">Play</span>
              <svg width="14" height="14" fill="none">
                <path d="M5 3v8l6-4-6-4z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 transition">
              <span className="sr-only">List</span>
              <svg width="14" height="14" fill="none">
                <rect x="3" y="4" width="8" height="2" rx="1" fill="#fff" />
                <rect x="3" y="8" width="8" height="2" rx="1" fill="#fff" />
              </svg>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 mb-4"></div>

        {/* Subnets and Flags */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div className="flex-shrink-0">
            <button className="bg-[#2d2350] text-xs px-3 py-1 rounded mb-2 font-medium flex items-center gap-1">
              All subnets <span className="text-slate-400">&rarr;</span>
            </button>
            <span className="text-4xl sm:text-5xl font-bold">{loading ? "..." : metrics.totalSubnets}</span>
            <div className="text-xs text-slate-300 mt-1">
              Subnets in {loading ? "..." : metrics.totalCountries} Countries
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <div className="flex flex-row flex-wrap gap-1 mb-1 max-w-[200px] sm:max-w-none">
              {topCountries.slice(0, 12).map((country) => (
                <CountryFlag key={country} countryCode={country} className="w-5 h-4 sm:w-6 sm:h-5" />
              ))}
            </div>
            <span className="text-xs text-emerald-400 font-semibold">+{topCountries.length - 12}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 my-4"></div>

        <div className="flex-1 flex flex-col justify-center">
          {/* Top row - 3 columns */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold">{loading ? "..." : metrics.totalNodes}</span>
              <span className="text-xs text-slate-300 mt-1">Node Machines</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold">{loading ? "..." : metrics.totalNodeProviders}</span>
              <span className="text-xs text-slate-300 mt-1">Node Providers</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold">{loading ? "..." : metrics.totalDataCenters}</span>
              <span className="text-xs text-slate-300 mt-1">Data Centers</span>
            </div>
          </div>

          {/* Bottom row - 3 columns centered */}
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold">{loading ? "..." : metrics.totalDCOwners}</span>
              <span className="text-xs text-slate-300 mt-1">DC Owners</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold">{loading ? "..." : metrics.totalRegions}</span>
              <span className="text-xs text-slate-300 mt-1">Regions</span>
            </div>
            <div></div> {/* Empty third column */}
          </div>
        </div>
      </div>
    </div>
  )
}
