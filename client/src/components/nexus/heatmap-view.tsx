'use client'

import { useEffect, useState } from 'react'
import { Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface HeatmapData {
  district: string
  zone: 'hot' | 'warm' | 'cool'
  predictedOrders: number
  confidence: number
  recommendedDrivers: number
}

const zoneConfig = {
  hot: {
    color: 'bg-red-500',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    label: 'HOT',
  },
  warm: {
    color: 'bg-orange-500',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    label: 'WARM',
  },
  cool: {
    color: 'bg-blue-500',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    label: 'COOL',
  },
}

export function HeatmapView() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        // In a real system, this would fetch from ML model
        // For now, we'll simulate data
        const data: HeatmapData[] = [
          { district: 'Al Olaya', zone: 'hot', predictedOrders: 45, confidence: 0.89, recommendedDrivers: 8 },
          { district: 'An Narjis', zone: 'hot', predictedOrders: 38, confidence: 0.85, recommendedDrivers: 6 },
          { district: 'Al Yasmin', zone: 'warm', predictedOrders: 28, confidence: 0.78, recommendedDrivers: 4 },
          { district: 'Al Malaz', zone: 'warm', predictedOrders: 22, confidence: 0.72, recommendedDrivers: 3 },
          { district: 'Al Sulaimaniyah', zone: 'cool', predictedOrders: 12, confidence: 0.65, recommendedDrivers: 2 },
          { district: 'Al Murabba', zone: 'cool', predictedOrders: 8, confidence: 0.60, recommendedDrivers: 1 },
          { district: 'Al Wurud', zone: 'warm', predictedOrders: 18, confidence: 0.75, recommendedDrivers: 3 },
          { district: 'Al Rawdah', zone: 'cool', predictedOrders: 10, confidence: 0.68, recommendedDrivers: 2 },
        ]
        setHeatmapData(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch heatmap:', error)
        setIsLoading(false)
      }
    }
    fetchHeatmap()
  }, [])

  const getTrend = (zone: string) => {
    if (zone === 'hot') return 'up'
    if (zone === 'warm') return 'stable'
    return 'down'
  }

  return (
    <div className="h-full bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          Predictive Demand Heatmap
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          ML-predicted order density for next 30-60 minutes
        </p>
      </div>

      {/* Summary */}
      <div className="p-3 border-b border-slate-700/50 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">
            {heatmapData.filter((d) => d.zone === 'hot').length}
          </div>
          <div className="text-xs text-slate-400">Hot Zones</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-400">
            {heatmapData.filter((d) => d.zone === 'warm').length}
          </div>
          <div className="text-xs text-slate-400">Warm Zones</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {heatmapData.filter((d) => d.zone === 'cool').length}
          </div>
          <div className="text-xs text-slate-400">Cool Zones</div>
        </div>
      </div>

      {/* District list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="text-center text-slate-500 py-8">Loading heatmap data...</div>
        ) : (
          heatmapData.map((district) => {
            const config = zoneConfig[district.zone]
            const trend = getTrend(district.zone)

            return (
              <div
                key={district.district}
                className={`rounded-lg p-3 border ${config.bgColor} ${config.borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{district.district}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color} text-white`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {district.predictedOrders} orders predicted
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {trend === 'up' && <TrendingUp className="w-4 h-4 text-red-400" />}
                      {trend === 'stable' && <Minus className="w-4 h-4 text-orange-400" />}
                      {trend === 'down' && <TrendingDown className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {(district.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="text-slate-400">
                    Recommended: <span className="text-white">{district.recommendedDrivers} drivers</span>
                  </div>
                  <button className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600 transition-colors text-white">
                    Position Drivers
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700/50">
        <div className="text-xs text-slate-500 text-center">
          Next prediction update in 5 minutes
        </div>
      </div>
    </div>
  )
}
