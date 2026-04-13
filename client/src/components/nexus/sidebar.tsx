'use client'

import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Map,
  Users,
  Flame,
  AlertTriangle,
  Settings,
  LogOut,
} from 'lucide-react'
import { useNexusStore } from '@/lib/nexus-store'

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map' as const, label: 'Live Map', icon: Map },
  { id: 'drivers' as const, label: 'Driver Fleet', icon: Users },
  { id: 'heatmaps' as const, label: 'Heatmaps', icon: Flame },
  { id: 'alerts' as const, label: 'Alerts', icon: AlertTriangle },
]

export function Sidebar() {
  const { sidebarTab, setSidebarTab, alerts } = useNexusStore()
  const unresolvedAlerts = alerts.filter((a) => !a.isResolved).length

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-lg">
            N
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide">NEXUS</h1>
            <p className="text-xs text-slate-400">Logistics Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = sidebarTab === item.id
          const showBadge = item.id === 'alerts' && unresolvedAlerts > 0

          return (
            <button
              key={item.id}
              onClick={() => setSidebarTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-cyan-600/20 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {showBadge && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unresolvedAlerts}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-slate-700 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Version */}
      <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-700">
        Version 1.0.0 | Phase 1 Foundation
      </div>
    </aside>
  )
}
