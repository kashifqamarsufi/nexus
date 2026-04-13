'use client'

import { useState } from 'react'
import { Play, Pause, Plus, RefreshCw, Zap } from 'lucide-react'

interface ControlPanelProps {
  onSimulateOrder: () => void
  onUpdatePositions: () => void
  isSimulating: boolean
  setIsSimulating: (value: boolean) => void
}

export function ControlPanel({
  onSimulateOrder,
  onUpdatePositions,
  isSimulating,
  setIsSimulating,
}: ControlPanelProps) {
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateOrder = async () => {
    setIsCreating(true)
    try {
      await onSimulateOrder()
    } finally {
      setTimeout(() => setIsCreating(false), 500)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {/* Simulation toggle */}
      <button
        onClick={() => setIsSimulating(!isSimulating)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isSimulating
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-slate-700 text-slate-300 border border-slate-600'
        }`}
      >
        {isSimulating ? (
          <>
            <Pause className="w-4 h-4" />
            Pause Simulation
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Start Simulation
          </>
        )}
      </button>

      {/* Create order */}
      <button
        onClick={handleCreateOrder}
        disabled={isCreating}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {isCreating ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        Create Order
      </button>

      {/* Auto-assign */}
      <button
        onClick={onUpdatePositions}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
      >
        <Zap className="w-4 h-4" />
        Auto-Assign
      </button>
    </div>
  )
}
