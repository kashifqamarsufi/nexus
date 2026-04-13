'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNexusStore, Driver, Warehouse } from '@/lib/nexus-store'

// Custom icons for drivers
const createDriverIcon = (status: string) => {
  const colors: Record<string, string> = {
    idle: '#22c55e',      // green
    at_pickup: '#eab308', // yellow
    delivering: '#3b82f6', // blue
    offline: '#6b7280',   // gray
  }
  const color = colors[status] || '#6b7280'

  return L.divIcon({
    className: 'driver-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Warehouse icon
const warehouseIcon = L.divIcon({
  className: 'warehouse-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border: 3px solid white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      color: white;
    ">W</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

// Heatmap colors
const zoneColors: Record<string, string> = {
  hot: 'rgba(239, 68, 68, 0.4)',   // red
  warm: 'rgba(249, 115, 22, 0.3)', // orange
  cool: 'rgba(59, 130, 246, 0.2)', // blue
}

function MapEvents() {
  const map = useMap()
  const { drivers } = useNexusStore()

  // Auto-fit bounds when drivers change
  useEffect(() => {
    if (drivers.length > 0) {
      const validDrivers = drivers.filter(d => d.lat && d.lng)
      if (validDrivers.length > 0) {
        const bounds = L.latLngBounds(
          validDrivers.map(d => [d.lat!, d.lng!])
        )
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [map])

  return null
}

export function LiveMap() {
  const { drivers, warehouses, heatmapVisible, selectedDriver, setSelectedDriver } = useNexusStore()

  // Riyadh center
  const center: [number, number] = useMemo(() => [24.7136, 46.6753], [])

  return (
    <div className="h-full bg-slate-800 rounded-xl overflow-hidden relative">
      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapEvents />

        {/* Warehouses */}
        {warehouses.map((warehouse) => (
          <Marker
            key={warehouse.id}
            position={[warehouse.lat, warehouse.lng]}
            icon={warehouseIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>{warehouse.name}</strong>
                <br />
                ID: {warehouse.id}
                <br />
                Queue: {warehouse.queueDepth} orders
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Drivers */}
        {drivers
          .filter((d) => d.lat && d.lng && d.status !== 'offline')
          .map((driver) => (
            <Marker
              key={driver.id}
              position={[driver.lat!, driver.lng!]}
              icon={createDriverIcon(driver.status)}
              eventHandlers={{
                click: () => setSelectedDriver(driver),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{driver.name}</strong>
                  <br />
                  {driver.driverCode}
                  <br />
                  Status: {driver.status}
                  <br />
                  Speed: {driver.speed.toFixed(0)} km/h
                  <br />
                  Score: {driver.performanceScore}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Heatmap overlay */}
        {heatmapVisible && (
          <>
            {/* Simulated demand zones */}
            <Circle
              center={[24.71, 46.67]}
              radius={2000}
              pathOptions={{ color: 'red', fillColor: zoneColors.hot, fillOpacity: 0.5 }}
            />
            <Circle
              center={[24.79, 46.66]}
              radius={1500}
              pathOptions={{ color: 'orange', fillColor: zoneColors.warm, fillOpacity: 0.4 }}
            />
            <Circle
              center={[24.81, 46.72]}
              radius={1800}
              pathOptions={{ color: 'red', fillColor: zoneColors.hot, fillOpacity: 0.5 }}
            />
          </>
        )}
      </MapContainer>

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => useNexusStore.setState({ heatmapVisible: !heatmapVisible })}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            heatmapVisible
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          🔥 Heatmap
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-800/90 rounded-lg p-3 text-xs text-slate-300">
        <div className="font-semibold mb-2">Driver Status</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>At Pickup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Delivering</span>
          </div>
        </div>
      </div>

      {/* Selected driver info */}
      {selectedDriver && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-slate-800/95 rounded-lg p-4 min-w-[200px]">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-white">{selectedDriver.name}</div>
              <div className="text-xs text-slate-400">{selectedDriver.driverCode}</div>
            </div>
            <button
              onClick={() => setSelectedDriver(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-white capitalize">{selectedDriver.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Rating:</span>
              <span className="text-white">⭐ {selectedDriver.rating}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Deliveries:</span>
              <span className="text-white">{selectedDriver.totalDeliveries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Score:</span>
              <span className="text-cyan-400 font-semibold">{selectedDriver.performanceScore}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
