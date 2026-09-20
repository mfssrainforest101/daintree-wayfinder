'use client'

import { useState } from 'react'
import { useWaypoints, toLngLat, type Waypoint } from '@/lib/store'
import { haversineKm, bearingDeg, compassPoint, formatKm } from '@/lib/geo'

export function WaypointList() {
  const waypoints = useWaypoints((s) => s.waypoints)
  const moveWaypoint = useWaypoints((s) => s.moveWaypoint)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  if (waypoints.length === 0) {
    return (
      <div className="empty">
        <p className="empty-title">No waypoints yet</p>
        <p className="empty-sub">
          Click anywhere on the map to drop a point, or add a marked spot from
          the list below.
        </p>
      </div>
    )
  }

  const handleDrop = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) moveWaypoint(dragIndex, index)
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <ol className="wp-list">
      {waypoints.map((wp, index) => {
        const prev = index > 0 ? waypoints[index - 1] : null
        const legKm = prev ? haversineKm(toLngLat(prev), toLngLat(wp)) : 0
        const heading = prev ? bearingDeg(toLngLat(prev), toLngLat(wp)) : null
        return (
          <li
            key={wp.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => {
              e.preventDefault()
              setOverIndex(index)
            }}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => {
              setDragIndex(null)
              setOverIndex(null)
            }}
            className={overIndex === index && dragIndex !== null ? 'drag-over' : ''}
          >
            <WaypointRow
              wp={wp}
              index={index}
              legText={
                prev
                  ? `${formatKm(legKm)} · ${compassPoint(heading!)} ${Math.round(heading!)}°`
                  : 'Start'
              }
            />
          </li>
        )
      })}
    </ol>
  )
}

function WaypointRow({
  wp,
  index,
  legText,
}: {
  wp: Waypoint
  index: number
  legText: string
}) {
  const selectedId = useWaypoints((s) => s.selectedId)
  const select = useWaypoints((s) => s.select)
  const rename = useWaypoints((s) => s.renameWaypoint)
  const remove = useWaypoints((s) => s.removeWaypoint)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(wp.name)

  const commit = () => {
    const name = draft.trim()
    if (name) rename(wp.id, name)
    else setDraft(wp.name)
    setEditing(false)
  }

  return (
    <div
      className={selectedId === wp.id ? 'wp-row selected' : 'wp-row'}
      onClick={() => select(wp.id)}
    >
      <span className="wp-index" aria-hidden="true" title="Drag to reorder">
        {index + 1}
      </span>
      <div className="wp-body">
        {editing ? (
          <input
            className="wp-name-input"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(wp.name)
                setEditing(false)
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <button
            type="button"
            className="wp-name"
            onClick={(e) => {
              e.stopPropagation()
              setDraft(wp.name)
              setEditing(true)
            }}
            title="Rename"
          >
            {wp.name}
          </button>
        )}
        <span className="wp-leg">{legText}</span>
        <span className="wp-coords">
          {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
        </span>
      </div>
      <button
        type="button"
        className="wp-remove"
        aria-label={`Remove ${wp.name}`}
        title="Remove"
        onClick={(e) => {
          e.stopPropagation()
          remove(wp.id)
        }}
      >
        ×
      </button>
    </div>
  )
}
