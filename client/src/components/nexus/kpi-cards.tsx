'use client'

import { Package, TrendingUp, AlertCircle, Truck } from 'lucide-react'
import { useNexusStore } from '@/lib/nexus-store'

export function KPICards() {
  const { kpis } = useNexusStore()

  const cards = [
    {
      title: 'Daily Load',
      value: kpis.dailyLoad,
      unit: 'orders',
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Fleet Success Rate',
      value: kpis.fleetSuccessRate,
      unit: '%',
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
      trend: '+2.3%',
      trendUp: true,
    },
    {
      title: 'Missed Revenue Alert',
      value: kpis.missedRevenue,
      unit: '%',
      icon: AlertCircle,
      color: 'from-amber-500 to-orange-500',
      trend: '-0.5%',
      trendUp: false,
    },
    {
      title: 'Active Drivers',
      value: `${kpis.activeDrivers}/${kpis.totalDrivers}`,
      unit: 'online',
      icon: Truck,
      color: 'from-violet-500 to-purple-500',
      trend: '',
      trendUp: true,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">{card.title}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-white">
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                  </span>
                  <span className="text-sm text-slate-400">{card.unit}</span>
                </div>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            {card.trend && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={`text-xs ${
                    card.trendUp ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {card.trendUp ? '↑' : '↓'} {card.trend}
                </span>
                <span className="text-xs text-slate-500">vs yesterday</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
