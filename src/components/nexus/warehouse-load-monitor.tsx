'use client'

import { useEffect } from 'react'
import { useNexusStore, Warehouse } from '@/lib/nexus-store'
import { Warehouse as WarehouseIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface WarehouseWithLoad extends Warehouse {
  loadPercent: number
  status: 'normal' | 'moderate' | 'overloaded'
}

export function WarehouseLoadMonitor() {
  const { warehouses, setWarehouses } = useNexusStore()

  // Fetch warehouses data
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await fetch('/api/warehouses')
        const data = await res.json()
        setWarehouses(data)
      } catch (error) {
        console.error('Failed to fetch warehouses:', error)
      }
    }
    fetchWarehouses()
  }, [setWarehouses])

  // Calculate load for each warehouse
  const warehousesWithLoad: WarehouseWithLoad[] = warehouses.map((w) => {
    // Simulate load calculation based on queue depth
    const loadPercent = Math.min(100, (w.queueDepth / 20) * 100 + Math.random() * 30)
    let status: 'normal' | 'moderate' | 'overloaded' = 'normal'
    if (loadPercent > 80) status = 'overloaded'
    else if (loadPercent > 50) status = 'moderate'

    return { ...w, loadPercent, status }
  })

  const getBarColor = (status: string) => {
    switch (status) {
      case 'overloaded':
        return 'bg-red-500'
      case 'moderate':
        return 'bg-purple-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getBgColor = (status: string) => {
    switch (status) {
      case 'overloaded':
        return 'bg-red-500/10 border-red-500/30'
      case 'moderate':
        return 'bg-purple-500/10 border-purple-500/30'
      default:
        return 'bg-blue-500/10 border-blue-500/30'
    }
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <WarehouseIcon className="w-4 h-4 text-amber-400" />
          Multi-Warehouse Load Monitor
        </h3>
        <span className="text-xs text-slate-400">Real-time capacity</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {warehousesWithLoad.map((warehouse) => (
          <div
            key={warehouse.id}
            className={`rounded-lg p-3 border ${getBgColor(warehouse.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium text-white">{warehouse.id}</div>
                <div className="text-xs text-slate-400 truncate max-w-[120px]">
                  {warehouse.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {Math.round(warehouse.loadPercent)}%
                </div>
                <div className="text-xs text-slate-400">
                  {warehouse.queueDepth} orders
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(warehouse.status)} transition-all duration-500`}
                style={{ width: `${warehouse.loadPercent}%` }}
              />
            </div>

            {/* Status indicator */}
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`text-xs capitalize ${
                  warehouse.status === 'overloaded'
                    ? 'text-red-400'
                    : warehouse.status === 'moderate'
                    ? 'text-purple-400'
                    : 'text-blue-400'
                }`}
              >
                {warehouse.status}
              </span>
              {warehouse.status === 'overloaded' && (
                <TrendingUp className="w-3 h-3 text-red-400" />
              )}
              {warehouse.status === 'normal' && (
                <TrendingDown className="w-3 h-3 text-blue-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-slate-400">Normal (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span className="text-slate-400">Moderate (50-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-slate-400">Overloaded (&gt;80%)</span>
        </div>
      </div>
    </div>
  )
}
