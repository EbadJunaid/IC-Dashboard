"use client"

import { useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { HelpTooltip } from "./HelpTooltip"

interface CanisterData {
  timestamp: number
  value: number
  date: string
  displayDate: string
}

type TimeRange = "1D" | "7D" | "1M" | "3M" | "1Y" | "All"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold text-lg">{payload[0].value.toLocaleString()}</p>
        <p className="text-slate-300 text-sm">{data.displayDate}</p>
      </div>
    )
  }
  return null
}

export function CanistersModule() {
  const [currentCanisters, setCurrentCanisters] = useState(0)
  const [chartData, setChartData] = useState<CanisterData[]>([])
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1D")
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)

  // Fetch current canister count
  useEffect(() => {
    const fetchCurrentCanisters = async () => {
      try {
        const response = await fetch("https://ic-api.internetcomputer.org/api/v3/metrics/registered-canisters-count")

        if (!response.ok) {
          console.error("Failed to fetch current canisters:", response.status)
          setCurrentCanisters(953300)
          return
        }

        const data = await response.json()
        console.log("Current canisters API response:", data)

        const current = data?.running_canisters?.[0]?.[1] ? Number.parseInt(data.running_canisters[0][1]) : 953300
        setCurrentCanisters(current)

        await fetchChartData("1D", data?.running_canisters?.[0]?.[0])
      } catch (error) {
        console.error("Error fetching current canisters:", error)
        setCurrentCanisters(953300)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchCurrentCanisters()

    // Refresh every 2 minutes
    const interval = setInterval(fetchCurrentCanisters, 120000)
    return () => clearInterval(interval)
  }, [])

  const fetchChartData = async (range: TimeRange, currentEpoch?: number) => {
    setChartLoading(true)
    try {
      const now = currentEpoch || Math.floor(Date.now() / 1000)
      let startTime: number
      let step: number

      // Calculate start time and step based on range
      switch (range) {
        case "1D":
          startTime = now - 86400 // 1 day
          step = 1200 // 20 minutes for 1D mode
          break
        case "7D":
          startTime = now - 604800 // 7 days
          step = 1800 // 30 minutes for 7D mode
          break
        case "1M":
          startTime = now - 2592000 // 30 days
          step = 10800 // 3 hour step
          break
        case "3M":
          startTime = now - 7776000 // 90 days
          step = 43200 // 12 hour step
          break
        case "1Y":
          startTime = now - 31536000 // 365 days
          step = 86400 // 1 day step
          break
        case "All":
          const launchDate = new Date("2021-06-03").getTime() / 1000
          startTime = launchDate
          step = 86400 // 1 day step
          break
        default:
          startTime = now - 86400
          step = 600
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 1 minute timeout

      const response = await fetch(
        `https://ic-api.internetcomputer.org/api/v3/metrics/registered-canisters-count?start=${Math.floor(startTime)}&step=${step}`,
        { signal: controller.signal },
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Canisters chart API response:", data)

      if (
        data &&
        data.running_canisters &&
        Array.isArray(data.running_canisters) &&
        data.running_canisters.length > 0
      ) {
        const chartPoints: CanisterData[] = data.running_canisters
          .map(([timestamp, value]: [number, string]) => {
            const canisterValue = Number.parseInt(value)
            if (isNaN(canisterValue) || isNaN(timestamp)) return null

            const date = new Date(timestamp * 1000)
            return {
              timestamp: timestamp * 1000,
              value: canisterValue,
              date: date.toISOString().split("T")[0],
              displayDate:
                range === "1D" || range === "7D"
                  ? `${date.toISOString().split("T")[0]}, ${date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "UTC",
                    })} UTC`
                  : date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }),
            }
          })
          .filter(Boolean)

        if (chartPoints.length > 0) {
          setChartData(chartPoints)
        } else {
          throw new Error("No valid canister chart data points")
        }
      } else {
        throw new Error("Invalid canister chart data format")
      }
    } catch (error) {
      console.error("Failed to fetch canister chart data:", error)

      // Fallback data
      const fallbackData: CanisterData[] = Array.from({ length: 10 }, (_, i) => {
        const timestamp = Date.now() - (9 - i) * 86400000
        return {
          timestamp,
          value: 900000 + i * 5000, // Progressive increase
          date: new Date(timestamp).toISOString().split("T")[0],
          displayDate: new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }
      })

      setChartData(fallbackData)
    } finally {
      setChartLoading(false)
    }
  }

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range)
    fetchChartData(range)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-4 md:p-6 text-white h-full shadow-2xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-32"></div>
          <div className="h-20 bg-gray-700 rounded mb-4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-4 md:p-6 text-white h-full shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base md:text-lg font-semibold">Canister Smart Contracts</h2>
          <p className="text-sm text-slate-400">(Dapps or Code Units)</p>
        </div>
        <div className="flex items-center space-x-2">
          <HelpTooltip content="The total number of registered canisters running on the Internet Computer blockchain." />
          <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center space-x-1">
            <span>View</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <div className="text-3xl md:text-4xl font-bold mb-1">
          {currentCanisters.toLocaleString().replace(/,/g, "'")}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-4 h-48">
        {chartLoading ? (
          <div className="h-full bg-gray-700/50 rounded animate-pulse flex items-center justify-center">
            <span className="text-gray-400">Loading chart...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="canisterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="none" stroke="#374151" opacity={0.2} horizontal={true} vertical={false} />
              <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={false} height={0} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                domain={[946000, 962000]}
                ticks={[946000, 950000, 954000, 958000, 962000]}
                tickFormatter={(value) => `${Math.round(value / 1000)}K`}
                width={35}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#canisterGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#ffffff",
                  stroke: "#8b5cf6",
                  strokeWidth: 2,
                  style: { filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" },
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Time Range Buttons */}
      <div className="flex flex-wrap gap-2">
        {(["1D", "7D", "1M", "3M", "1Y", "All"] as TimeRange[]).map((range) => (
          <Button
            key={range}
            variant={selectedRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => handleRangeChange(range)}
            className={`text-xs ${
              selectedRange === range
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {range}
          </Button>
        ))}
      </div>
    </div>
  )
}
