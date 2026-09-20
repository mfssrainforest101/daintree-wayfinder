'use client'

import { useWaypoints, toLngLat } from '@/lib/store'
import { routeLengthKm, walkingHours, formatKm, formatDuration } from '@/lib/geo'

export function RouteStats() {
  const waypoints = useWaypoints((s) => s.waypoints)
  const km = routeLengthKm(waypoints.map(toLngLat))
  const legs = Math.max(0, waypoints.length - 1)

  return (
    <div className="stats">
      <Stat label="Waypoints" value={String(waypoints.length)} />
      <Stat label="Distance" value={formatKm(km)} />
      <Stat label="Legs" value={String(legs)} />
      <Stat label="On foot" value={legs ? formatDuration(walkingHours(km)) : '—'} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}
