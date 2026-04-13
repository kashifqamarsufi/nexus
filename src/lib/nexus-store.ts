import { create } from 'zustand'

// Driver status type
export type DriverStatus = 'offline' | 'idle' | 'at_pickup' | 'delivering'

// Driver type
export interface Driver {
  id: string
  driverCode: string
  name: string
  phone: string | null
  vehicleType: string
  status: DriverStatus
  lat: number | null
  lng: number | null
  speed: number
  heading: number
  performanceScore: number
  totalDeliveries: number
  successfulDeliveries: number
  rating: number
  homeWarehouseId: string | null
  lastPingAt: string | null
  isActive: boolean
}

// Order status type
export type OrderStatus = 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'failed' | 'cancelled'

// Order type
export interface Order {
  id: string
  orderCode: string
  vendorName: string
  customerName: string | null
  customerPhone: string | null
  customerAddress: string
  customerLat: number | null
  customerLng: number | null
  pickupWarehouseId: string
  driverId: string | null
  status: OrderStatus
  priority: string
  distanceKm: number
  carbonKg: number
  predictedEta: string | null
  createdAt: string
  updatedAt: string
}

// Warehouse type
export interface Warehouse {
  id: string
  name: string
  city: string
  lat: number
  lng: number
  isActive: boolean
  queueDepth: number
}

// Alert type
export interface Alert {
  id: string
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  recommendedAction: string | null
  driverId: string | null
  orderId: string | null
  isResolved: boolean
  createdAt: string
}

// Assignment type
export interface Assignment {
  id: string
  driverCode: string
  driverName: string
  warehouseId: string
  warehouseName: string
  district: string
  baseEta: number
  mlEta: number
  isBatched: boolean
  timestamp: string
}

// KPI type
export interface KPIData {
  dailyLoad: number
  fleetSuccessRate: number
  missedRevenue: number
  activeDrivers: number
  totalDrivers: number
  activeOrders: number
}

// Store state
interface NexusState {
  // Data
  drivers: Driver[]
  orders: Order[]
  warehouses: Warehouse[]
  alerts: Alert[]
  assignments: Assignment[]
  kpis: KPIData

  // UI State
  selectedDriver: Driver | null
  selectedOrder: Order | null
  heatmapVisible: boolean
  sidebarTab: 'dashboard' | 'map' | 'drivers' | 'heatmaps' | 'alerts'

  // Actions
  setDrivers: (drivers: Driver[]) => void
  setOrders: (orders: Order[]) => void
  setWarehouses: (warehouses: Warehouse[]) => void
  setAlerts: (alerts: Alert[]) => void
  setAssignments: (assignments: Assignment[]) => void
  setKPIs: (kpis: KPIData) => void
  setSelectedDriver: (driver: Driver | null) => void
  setSelectedOrder: (order: Order | null) => void
  setHeatmapVisible: (visible: boolean) => void
  setSidebarTab: (tab: 'dashboard' | 'map' | 'drivers' | 'heatmaps' | 'alerts') => void

  // Real-time updates
  updateDriverPosition: (driverId: string, lat: number, lng: number, speed: number, heading: number) => void
  addAssignment: (assignment: Assignment) => void
  addAlert: (alert: Alert) => void
  resolveAlert: (alertId: string) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
}

export const useNexusStore = create<NexusState>((set) => ({
  // Initial data
  drivers: [],
  orders: [],
  warehouses: [],
  alerts: [],
  assignments: [],
  kpis: {
    dailyLoad: 0,
    fleetSuccessRate: 97.5,
    missedRevenue: 0.2,
    activeDrivers: 0,
    totalDrivers: 0,
    activeOrders: 0,
  },

  // UI State
  selectedDriver: null,
  selectedOrder: null,
  heatmapVisible: false,
  sidebarTab: 'dashboard',

  // Setters
  setDrivers: (drivers) => set({ drivers }),
  setOrders: (orders) => set({ orders }),
  setWarehouses: (warehouses) => set({ warehouses }),
  setAlerts: (alerts) => set({ alerts }),
  setAssignments: (assignments) => set({ assignments }),
  setKPIs: (kpis) => set({ kpis }),
  setSelectedDriver: (driver) => set({ selectedDriver: driver }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setHeatmapVisible: (visible) => set({ heatmapVisible: visible }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  // Real-time updates
  updateDriverPosition: (driverId, lat, lng, speed, heading) =>
    set((state) => ({
      drivers: state.drivers.map((d) =>
        d.id === driverId ? { ...d, lat, lng, speed, heading } : d
      ),
    })),

  addAssignment: (assignment) =>
    set((state) => ({
      assignments: [assignment, ...state.assignments].slice(0, 50),
    })),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
    })),

  resolveAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, isResolved: true } : a
      ),
    })),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    })),
}))
