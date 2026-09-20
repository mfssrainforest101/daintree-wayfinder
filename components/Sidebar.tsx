'use client'

import { useWaypoints, toLngLat } from '@/lib/store'
import { RouteStats } from './RouteStats'
import { StyleSwitcher } from './StyleSwitcher'
import { WaypointList } from './WaypointList'
import { PoiList } from './PoiList'

export function Sidebar() {
  const waypoints = useWaypoints((s) => s.waypoints)
  const reverse = useWaypoints((s) => s.reverse)
  const clear = useWaypoints((s) => s.clear)
  const requestFit = useWaypoints((s) => s.requestFit)

  const hasRoute = waypoints.length > 0

  const exportGeoJson = () => {
    const collection = {
      type: 'FeatureCollection' as const,
      features: [
        ...waypoints.map((w, i) => ({
          type: 'Feature' as const,
          properties: { name: w.name, order: i + 1 },
          geometry: { type: 'Point' as const, coordinates: [w.lng, w.lat] },
        })),
        ...(waypoints.length > 1
          ? [
              {
                type: 'Feature' as const,
                properties: { name: 'Route' },
                geometry: {
                  type: 'LineString' as const,
                  coordinates: waypoints.map(toLngLat).map((p) => [p.lng, p.lat]),
                },
              },
            ]
          : []),
      ],
    }
    const blob = new Blob([JSON.stringify(collection, null, 2)], {
      type: 'application/geo+json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'daintree-route.geojson'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside className="sidebar">
      <header className="brand">
        <div className="brand-mark" aria-hidden="true">
          <span />
        </div>
        <div>
          <h1>Daintree Wayfinder</h1>
          <p>Plot a route through the world&apos;s oldest rainforest.</p>
        </div>
      </header>

      <section className="panel">
        <RouteStats />
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Base map</h2>
        </div>
        <StyleSwitcher />
      </section>

      <section className="panel actions">
        <button type="button" onClick={requestFit} disabled={!hasRoute}>
          Fit route
        </button>
        <button type="button" onClick={reverse} disabled={waypoints.length < 2}>
          Reverse
        </button>
        <button type="button" onClick={exportGeoJson} disabled={!hasRoute}>
          Export
        </button>
        <button
          type="button"
          className="danger"
          onClick={clear}
          disabled={!hasRoute}
        >
          Clear
        </button>
      </section>

      <section className="panel grow">
        <div className="panel-head">
          <h2>Route</h2>
          <span className="hint">drag to reorder</span>
        </div>
        <WaypointList />
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Marked places</h2>
          <span className="hint">tap to add</span>
        </div>
        <PoiList />
      </section>

      <footer className="foot">
        Click the map to drop a waypoint · numbers are stops in order
      </footer>
    </aside>
  )
}
