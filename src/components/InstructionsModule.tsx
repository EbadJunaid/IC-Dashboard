"use client"

import { useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { HelpTooltip } from "./HelpTooltip"

interface InstructionData {
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
        <p className="text-white font-semibold text-lg">{payload[0].value.toFixed(2)}</p>
        <p className="text-slate-300 text-sm">{data.displayDate}</p>
      </div>
    )
  }
  return null
}

export function InstructionsModule() {
  const [currentInstructions, setCurrentInstructions] = useState(0)
  const [chartData, setChartData] = useState<InstructionData[]>([])
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1D")
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [yAxisTicks, setYAxisTicks] = useState<number[]>([])

  // Function to calculate dynamic Y-axis ticks based on data
  const calculateYAxisTicks = (data: InstructionData[]) => {
    if (data.length === 0) return [0, 20, 40, 60, 80, 100]
    
    const values = data.map(d => d.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    
    // Add some padding (10% on each side)
    const padding = (maxValue - minValue) * 0.1
    const adjustedMin = Math.max(0, minValue - padding)
    const adjustedMax = maxValue + padding
    
    // Create 5 equal intervals
    const interval = (adjustedMax - adjustedMin) / 4
    const ticks = []
    
    for (let i = 0; i <= 4; i++) {
      ticks.push(adjustedMin + (interval * i))
    }
    
    return ticks
  }

  // Custom tick formatter for Y-axis
  const formatYAxisTick = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    } else {
      return value.toFixed(0)
    }
  }

  // Custom formatter for X-axis based on selected range
  const formatXAxisTick = (tickItem: any, index: number) => {
    if (selectedRange === "1D" || selectedRange === "7D") {
      // For short ranges, don't show any ticks to avoid clutter
      return ""
    }
    return ""
  }

  // Fetch current instruction rate
  useEffect(() => {
    const fetchCurrentInstructions = async () => {
      try {
        const response = await fetch("https://ic-api.internetcomputer.org/api/v3/metrics/instruction-rate")

        if (!response.ok) {
          console.error("Failed to fetch current instructions:", response.status)
          setCurrentInstructions(58.698)
          return
        }

        const data = await response.json()
        console.log("Current instructions API response:", data)

        // Extract instruction rate and convert to millions
        const current = data?.instruction_rate?.[1] ? Number.parseFloat(data.instruction_rate[1]) / 1000000 : 58.698

        setCurrentInstructions(current)

        // Load initial 1D chart data
        await fetchChartData("1D", data?.instruction_rate?.[0])
      } catch (error) {
        console.error("Error fetching current instructions:", error)
        setCurrentInstructions(58.698) // Fallback value
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchCurrentInstructions()

    // Refresh every 2 minutes
    const interval = setInterval(fetchCurrentInstructions, 120000)
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
        `https://ic-api.internetcomputer.org/api/v3/metrics/instruction-rate?start=${Math.floor(startTime)}&step=${step}`,
        { signal: controller.signal },
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error("Failed to fetch instruction chart data:", response.status)
        // Set fallback data
        const fallbackData: InstructionData[] = Array.from({ length: 10 }, (_, i) => {
          const timestamp = Date.now() - (9 - i) * 86400000
          return {
            timestamp,
            value: 55 + Math.random() * 10,
            date: new Date(timestamp).toISOString().split("T")[0],
            displayDate: new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          }
        })
        setChartData(fallbackData)
        setYAxisTicks(calculateYAxisTicks(fallbackData))
        return
      }

      const data = await response.json()
      console.log("Instructions chart API response:", data)

      if (data && data.instruction_rate && Array.isArray(data.instruction_rate) && data.instruction_rate.length > 0) {
        const chartPoints: InstructionData[] = data.instruction_rate
          .map(([timestamp, value]: [number, string]) => {
            const instructionValue = Number.parseFloat(value) / 1000000 // Convert to millions
            if (isNaN(instructionValue) || isNaN(timestamp)) return null

            const date = new Date(timestamp * 1000)

            return {
              timestamp: timestamp * 1000, // Convert to milliseconds for proper plotting
              value: instructionValue,
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
          // Sort by timestamp to ensure proper order
          chartPoints.sort((a, b) => a.timestamp - b.timestamp)
          setChartData(chartPoints)
          setYAxisTicks(calculateYAxisTicks(chartPoints))
        } else {
          console.error("No valid instruction chart data points")
        }
      } else {
        console.error("Invalid instruction chart data format")
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("Instruction chart data fetch was aborted (timeout):", error)
      } else {
        console.error("Error fetching instruction chart data:", error)
      }
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
            <h2 className="text-base md:text-lg font-semibold">Million Instructions Executed </h2>
            <p className="text-sm text-slate-400">(Per second)</p>
        </div>
        <div className="flex items-center space-x-2">
          <HelpTooltip content="The number of instructions executed per second across all canisters on the Internet Computer, measured in millions." />
          <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center space-x-1">
            <span>View</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <div className="text-3xl md:text-4xl font-bold mb-1">
          {currentInstructions.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, "'")}
          <span className="text-lg text-slate-400 ml-2">MIEPs</span>
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
                <linearGradient id="instructionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="none" stroke="#374151" opacity={0.2} horizontal={true} vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                axisLine={false} 
                tickLine={false} 
                tick={false} 
                height={0} 
                tickFormatter={formatXAxisTick}
              />
              <YAxis
                ticks={yAxisTicks}
                tickFormatter={formatYAxisTick}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                width={35}
                domain={['dataMin', 'dataMax']}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#instructionGradient)"
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