'use client'

import { useEffect, useState } from 'react'
import { useNexusStore, Assignment } from '@/lib/nexus-store'
import { ChevronRight, Zap, Package } from 'lucide-react'

export function AssignmentFeed() {
  const { assignments, addAssignment } = useNexusStore()
  const [isLive, setIsLive] = useState(true)

  // Simulate new assignments coming in
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      // Random chance to add new assignment
      if (Math.random() > 0.7) {
        const driverNames = [
          { name: 'Ahmad Al-Khalidi', code: 'DRV-1847' },
          { name: 'Fahad Al-Otaibi', code: 'DRV-2093' },
          { name: 'Khalid Al-Rashid', code: 'DRV-4421' },
          { name: 'Turki Al-Shammari', code: 'DRV-8901' },
        ]
        const warehouses = [
          { id: 'KR-05', name: 'Al Olaya DC' },
          { id: 'KR-53', name: 'An Narjis Warehouse' },
          { id: 'KR-72', name: 'Al Yasmin Center' },
        ]
        const districts = ['Al Olaya', 'An Narjis', 'Al Yasmin', 'Al Malaz']

        const driver = driverNames[Math.floor(Math.random() * driverNames.length)]
        const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)]
        const district = districts[Math.floor(Math.random() * districts.length)]

        const newAssignment: Assignment = {
          id: `asg-${Date.now()}`,
          driverCode: driver.code,
          driverName: driver.name,
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          district,
          baseEta: Math.floor(Math.random() * 15) + 10,
          mlEta: Math.floor(Math.random() * 20) + 12,
          isBatched: Math.random() > 0.7,
          timestamp: new Date().toISOString(),
        }

        addAssignment(newAssignment)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isLive, addAssignment])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="h-full bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Autonomous Assignments
          </h3>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-2 py-1 rounded text-xs font-medium ${
              isLive
                ? 'bg-green-500/20 text-green-400'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {isLive ? '● LIVE' : 'PAUSED'}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Real-time driver-order matching
        </p>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {assignments.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Waiting for assignments...</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-white text-sm">
                    {assignment.driverName}
                  </div>
                  <div className="text-xs text-slate-400">
                    {assignment.driverCode}
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  {formatTime(assignment.timestamp)}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                  {assignment.warehouseId}
                </span>
                <ChevronRight className="w-3 h-3" />
                <span>{assignment.district}</span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Base ETA: </span>
                    <span className="text-white">{assignment.baseEta}m</span>
                  </div>
                  <div>
                    <span className="text-slate-500">ML ETA: </span>
                    <span className="text-cyan-400">{assignment.mlEta}m</span>
                  </div>
                </div>
                {assignment.isBatched && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">
                    BATCHED
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-900/30">
        <div className="flex justify-between text-xs">
          <div>
            <span className="text-slate-500">Total Today: </span>
            <span className="text-white font-medium">{assignments.length}</span>
          </div>
          <div>
            <span className="text-slate-500">Avg ETA: </span>
            <span className="text-cyan-400 font-medium">
              {assignments.length > 0
                ? Math.round(
                    assignments.reduce((acc, a) => acc + a.mlEta, 0) / assignments.length
                  )
                : 0}
              m
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
