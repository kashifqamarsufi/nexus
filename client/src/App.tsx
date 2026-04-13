import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Sidebar } from '@/components/nexus/sidebar'
import { KPICards } from '@/components/nexus/kpi-cards'
import { AssignmentFeed } from '@/components/nexus/assignment-feed'
import { WarehouseLoadMonitor } from '@/components/nexus/warehouse-load-monitor'
import { DriverFleetTable } from '@/components/nexus/driver-fleet-table'
import { AlertsPanel } from '@/components/nexus/alerts-panel'
import { HeatmapView } from '@/components/nexus/heatmap-view'
import { ControlPanel } from '@/components/nexus/control-panel'
import { useNexusStore, type Assignment } from '@/lib/nexus-store'
import { Toaster } from '@/components/ui/toaster'

const LiveMap = lazy(() =>
  import('@/components/nexus/live-map').then((mod) => ({ default: mod.LiveMap })),
)

export default function App() {
  const {
    sidebarTab,
    setDrivers,
    setOrders,
    setWarehouses,
    setAlerts,
    setKPIs,
    addAssignment,
    orders,
  } = useNexusStore()
  const [isSimulating, setIsSimulating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(async () => {
      try {
        await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_positions' }),
        })

        const res = await fetch('/api/drivers')
        const data = await res.json()
        setDrivers(data)
      } catch (error) {
        console.error('Simulation error:', error)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isSimulating, setDrivers])

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

  const handleCreateOrder = useCallback(async () => {
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_order' }),
      })
      const data = await res.json()

      if (data.success) {
        const ordersRes = await fetch('/api/orders')
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }, [setOrders])

  const normalizeAssignment = (raw: Record<string, unknown>): Assignment => {
    const district =
      typeof raw.district === 'string'
        ? raw.district
        : typeof raw.customerDistrict === 'string'
          ? raw.customerDistrict
          : 'Riyadh'
    return {
      id: typeof raw.id === 'string' ? raw.id : `asg-${Date.now()}`,
      driverCode: String(raw.driverCode ?? ''),
      driverName: String(raw.driverName ?? ''),
      warehouseId: String(raw.warehouseId ?? ''),
      warehouseName: String(raw.warehouseName ?? ''),
      district,
      baseEta: Number(raw.baseEta ?? 0),
      mlEta: Number(raw.mlEta ?? 0),
      isBatched: Boolean(raw.isBatched),
      timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : new Date().toISOString(),
    }
  }

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
          addAssignment(normalizeAssignment(data.assignment as Record<string, unknown>))
        }
      }

      const [ordersRes, driversRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/drivers'),
      ])
      const [ordersData, driversData] = await Promise.all([ordersRes.json(), driversRes.json()])
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

  const mapFallback = (
    <div className="h-full bg-slate-800 rounded-xl flex items-center justify-center">
      <div className="text-slate-400">Loading map...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <ControlPanel
          onSimulateOrder={handleCreateOrder}
          onUpdatePositions={handleAutoAssign}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
        />

        {sidebarTab === 'dashboard' && (
          <div className="p-4 pt-20">
            <KPICards />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="col-span-2 h-[500px]">
                <Suspense fallback={mapFallback}>
                  <LiveMap />
                </Suspense>
              </div>
              <div className="h-[500px]">
                <AssignmentFeed />
              </div>
            </div>
            <div className="mt-4">
              <WarehouseLoadMonitor />
            </div>
          </div>
        )}

        {sidebarTab === 'map' && (
          <div className="p-4 pt-20 h-screen">
            <div className="h-[calc(100vh-120px)]">
              <Suspense fallback={mapFallback}>
                <LiveMap />
              </Suspense>
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
      <Toaster />
    </div>
  )
}
