'use client'

import { useEffect } from 'react'
import { useNexusStore, Driver } from '@/lib/nexus-store'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  MapPin, 
  Star,
  Bike,
  Car,
  Truck as TruckIcon,
} from 'lucide-react'
import { useState } from 'react'

const vehicleIcons = {
  motorcycle: Bike,
  car: Car,
  van: TruckIcon,
}

const statusColors: Record<string, string> = {
  idle: 'bg-green-500/20 text-green-400',
  at_pickup: 'bg-yellow-500/20 text-yellow-400',
  delivering: 'bg-blue-500/20 text-blue-400',
  offline: 'bg-gray-500/20 text-gray-400',
}

export function DriverFleetTable() {
  const { drivers, setDrivers, selectedDriver, setSelectedDriver } = useNexusStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch('/api/drivers')
        const data = await res.json()
        setDrivers(data)
      } catch (error) {
        console.error('Failed to fetch drivers:', error)
      }
    }
    fetchDrivers()
  }, [setDrivers])

  // Filter drivers
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.driverCode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400'
    if (score >= 75) return 'text-cyan-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="h-full bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="font-semibold text-white mb-3">Driver Fleet</h3>
        
        {/* Search and filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="idle">Idle</option>
            <option value="at_pickup">At Pickup</option>
            <option value="delivering">Delivering</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="p-3 border-b border-slate-700/50 grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-lg font-bold text-green-400">
            {drivers.filter((d) => d.status === 'idle').length}
          </div>
          <div className="text-xs text-slate-400">Idle</div>
        </div>
        <div>
          <div className="text-lg font-bold text-yellow-400">
            {drivers.filter((d) => d.status === 'at_pickup').length}
          </div>
          <div className="text-xs text-slate-400">At Pickup</div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-400">
            {drivers.filter((d) => d.status === 'delivering').length}
          </div>
          <div className="text-xs text-slate-400">Delivering</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-400">
            {drivers.filter((d) => d.status === 'offline').length}
          </div>
          <div className="text-xs text-slate-400">Offline</div>
        </div>
      </div>

      {/* Driver list */}
      <div className="flex-1 overflow-y-auto">
        {filteredDrivers.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            No drivers found
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredDrivers.map((driver) => {
              const VehicleIcon = vehicleIcons[driver.vehicleType] || Bike
              const isSelected = selectedDriver?.id === driver.id

              return (
                <div
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  className={`p-3 hover:bg-slate-700/30 cursor-pointer transition-colors ${
                    isSelected ? 'bg-cyan-500/10 border-l-2 border-cyan-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {driver.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>

                      <div>
                        <div className="font-medium text-white">{driver.name}</div>
                        <div className="text-xs text-slate-400">{driver.driverCode}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-medium ${getPerformanceColor(driver.performanceScore)}`}>
                        {driver.performanceScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-400">
                        ⭐ {driver.rating}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[driver.status]}`}>
                        {driver.status}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <VehicleIcon className="w-3 h-3" />
                        <span className="capitalize">{driver.vehicleType}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {driver.totalDeliveries} deliveries
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700/50 text-center text-xs text-slate-500">
        {filteredDrivers.length} of {drivers.length} drivers
      </div>
    </div>
  )
}
