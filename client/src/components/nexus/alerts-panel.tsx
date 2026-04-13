'use client'

import { useEffect } from 'react'
import { useNexusStore } from '@/lib/nexus-store'
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from 'lucide-react'

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'bg-red-500/20 text-red-400 border-red-500/50',
    iconColor: 'text-red-400',
  },
  high: {
    icon: AlertCircle,
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    iconColor: 'text-orange-400',
  },
  medium: {
    icon: Info,
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    iconColor: 'text-yellow-400',
  },
  low: {
    icon: Info,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    iconColor: 'text-blue-400',
  },
}

const alertTypeLabels: Record<string, string> = {
  driver_stalled: 'Driver Stalled',
  sla_breach: 'SLA Breach Imminent',
  wrong_direction: 'Wrong Direction',
  vendor_delay: 'Vendor Delay',
  cluster_failure: 'Cluster Failure',
}

export function AlertsPanel() {
  const { alerts, setAlerts, resolveAlert } = useNexusStore()

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts')
        const data = await res.json()
        setAlerts(data)
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
      }
    }
    fetchAlerts()
  }, [setAlerts])

  const handleResolve = async (alertId: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId }),
      })
      resolveAlert(alertId)
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const unresolvedAlerts = alerts.filter((a) => !a.isResolved)
  const resolvedAlerts = alerts.filter((a) => a.isResolved)

  return (
    <div className="h-full bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          Alerts Center
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {unresolvedAlerts.length} unresolved alerts
        </p>
      </div>

      {/* Unresolved alerts */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {unresolvedAlerts.length === 0 && resolvedAlerts.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="text-sm">All clear!</p>
            <p className="text-xs">No active alerts</p>
          </div>
        ) : (
          <>
            {unresolvedAlerts.map((alert) => {
              const config = severityConfig[alert.severity]
              const Icon = config.icon

              return (
                <div
                  key={alert.id}
                  className={`rounded-lg p-3 border ${config.color}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <Icon className={`w-5 h-5 mt-0.5 ${config.iconColor}`} />
                      <div>
                        <div className="font-medium text-white text-sm">
                          {alertTypeLabels[alert.type] || alert.type}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {alert.message}
                        </div>
                        {alert.recommendedAction && (
                          <div className="text-xs text-slate-300 mt-2 p-2 bg-slate-900/50 rounded">
                            💡 {alert.recommendedAction}
                          </div>
                        )}
                        <div className="text-xs text-slate-500 mt-2">
                          {formatTime(alert.createdAt)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Resolved alerts */}
            {resolvedAlerts.length > 0 && (
              <div className="pt-4 border-t border-slate-700/50">
                <div className="text-xs text-slate-500 mb-2">Resolved</div>
                {resolvedAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-lg p-2 bg-slate-900/30 text-slate-500 text-xs mb-1"
                  >
                    <span className="text-slate-400">{alertTypeLabels[alert.type]}</span>
                    <span className="float-right">✓ Resolved</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="p-3 border-t border-slate-700/50 grid grid-cols-4 gap-2 text-center text-xs">
        <div>
          <div className="text-lg font-bold text-red-400">
            {alerts.filter((a) => a.severity === 'critical' && !a.isResolved).length}
          </div>
          <div className="text-slate-400">Critical</div>
        </div>
        <div>
          <div className="text-lg font-bold text-orange-400">
            {alerts.filter((a) => a.severity === 'high' && !a.isResolved).length}
          </div>
          <div className="text-slate-400">High</div>
        </div>
        <div>
          <div className="text-lg font-bold text-yellow-400">
            {alerts.filter((a) => a.severity === 'medium' && !a.isResolved).length}
          </div>
          <div className="text-slate-400">Medium</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-400">
            {resolvedAlerts.length}
          </div>
          <div className="text-slate-400">Resolved</div>
        </div>
      </div>
    </div>
  )
}
