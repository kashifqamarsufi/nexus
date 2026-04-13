'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Sidebar } from '@/components/nexus/sidebar'
import { KPICards } from '@/components/nexus/kpi-cards'
import { AssignmentFeed } from '@/components/nexus/assignment-feed'
import { WarehouseLoadMonitor } from '@/components/nexus/warehouse-load-monitor'
import { DriverFleetTable } from '@/components/nexus/driver-fleet-table'
import { AlertsPanel } from '@/components/nexus/alerts-panel'
import { HeatmapView } from '@/components/nexus/heatmap-view'
import { ControlPanel } from '@/components/nexus/control-panel'
import { useNexusStore, Assignment } from '@/lib/nexus-store'

// Dynamically import the map to avoid SSR issues with Leaflet
const LiveMap = dynamic(
  () => import('@/components/nexus/live-map').then((mod) => mod.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-slate-800 rounded-xl flex items-center justify-center">
        <div className="text-slate-400">Loading map...</div>
      </div>
    ),
  }
)

export default function NexusDashboard() {
  const {
    sidebarTab,
    setDrivers,
    setOrders,
    setWarehouses,
    setAlerts,
    setKPIs,
    addAssignment,
    drivers,
    orders,
  } = useNexusStore()
  const [isSimulating, setIsSimulating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversRes, ordersRes, warehousesRes, alertsRes, kpisRes] = await Promise.all([
          fetch('/api/drivers'),
          fetch('/api/orders'),
          fetch('/api/warehouses'),
          fetch('/api/alerts'),
          fetch('/api/kpis'),
        ])

        const [driversData, ordersData, warehousesData, alertsData, kpisData] = await Promise.all([
          driversRes.json(),
          ordersRes.json(),
          warehousesRes.json(),
          alertsRes.json(),
          kpisRes.json(),
        ])

        setDrivers(driversData)
        setOrders(ordersData)
        setWarehouses(warehousesData)
        setAlerts(alertsData)
        setKPIs(kpisData)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch initial data:', error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [setDrivers, setOrders, setWarehouses, setAlerts, setKPIs])

  // Simulation loop
  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(async () => {
      try {
        // Update driver positions
        await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_positions' }),
        })

        // Refresh drivers
        const res = await fetch('/api/drivers')
        const data = await res.json()
        setDrivers(data)
      } catch (error) {
        console.error('Simulation error:', error)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isSimulating, setDrivers])

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const kpisRes = await fetch('/api/kpis')
        const kpisData = await kpisRes.json()
        setKPIs(kpisData)
      } catch (error) {
        console.error('Failed to refresh KPIs:', error)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [setKPIs])

  // Handle order creation
  const handleCreateOrder = useCallback(async () => {
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_order' }),
      })
      const data = await res.json()

      if (data.success) {
        // Refresh orders
        const ordersRes = await fetch('/api/orders')
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }, [setOrders])

  // Handle auto-assign
  const handleAutoAssign = useCallback(async () => {
    try {
      const pendingOrders = orders.filter((o) => o.status === 'pending')
      
      for (const order of pendingOrders.slice(0, 3)) {
        const res = await fetch('/api/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        })
        const data = await res.json()

        if (data.success && data.assignment) {
          addAssignment(data.assignment)
        }
      }

      // Refresh data
      const [ordersRes, driversRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/drivers'),
      ])
      const [ordersData, driversData] = await Promise.all([
        ordersRes.json(),
        driversRes.json(),
      ])
      setOrders(ordersData)
      setDrivers(driversData)
    } catch (error) {
      console.error('Auto-assign error:', error)
    }
  }, [orders, addAssignment, setOrders, setDrivers])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading NEXUS Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="ml-64 min-h-screen">
        {/* Control panel */}
        <ControlPanel
          onSimulateOrder={handleCreateOrder}
          onUpdatePositions={handleAutoAssign}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
        />

        {/* Content based on selected tab */}
        {sidebarTab === 'dashboard' && (
          <div className="p-4 pt-20">
            {/* KPI Cards */}
            <KPICards />

            {/* Main grid */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {/* Map - takes 2 columns */}
              <div className="col-span-2 h-[500px]">
                <LiveMap />
              </div>

              {/* Assignment feed */}
              <div className="h-[500px]">
                <AssignmentFeed />
              </div>
            </div>

            {/* Warehouse load monitor */}
            <div className="mt-4">
              <WarehouseLoadMonitor />
            </div>
          </div>
        )}

        {sidebarTab === 'map' && (
          <div className="p-4 pt-20 h-screen">
            <div className="h-[calc(100vh-120px)]">
              <LiveMap />
            </div>
          </div>
        )}

        {sidebarTab === 'drivers' && (
          <div className="p-4 pt-20 h-screen">
            <div className="h-[calc(100vh-120px)]">
              <DriverFleetTable />
            </div>
          </div>
        )}

        {sidebarTab === 'heatmaps' && (
          <div className="p-4 pt-20 h-screen">
            <div className="h-[calc(100vh-120px)]">
              <HeatmapView />
            </div>
          </div>
        )}

        {sidebarTab === 'alerts' && (
          <div className="p-4 pt-20 h-screen">
            <div className="h-[calc(100vh-120px)]">
              <AlertsPanel />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
