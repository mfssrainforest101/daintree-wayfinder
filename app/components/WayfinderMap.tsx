'use client'
import { useEffect, useRef, useCallback } from 'react'
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl'
import { useWayfinderStore } from '../store'

// Interpolate a position along a polyline given progress 0–1
function interpolateRoute(
  coords: [number, number][],
  t: number
): [number, number] {
  if (coords.length === 0) return [0, 0]
  if (coords.length === 1) return coords[0]
  if (t <= 0) return coords[0]
  if (t >= 1) return coords[coords.length - 1]

  // Compute segment lengths
  const dists: number[] = []
  let total = 0
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i][0] - coords[i - 1][0]
    const dy = coords[i][1] - coords[i - 1][1]
    const d = Math.sqrt(dx * dx + dy * dy)
    dists.push(d)
    total += d
  }

  let target = t * total
  for (let i = 0; i < dists.length; i++) {
    if (target <= dists[i]) {
      const frac = dists[i] === 0 ? 0 : target / dists[i]
      return [
        coords[i][0] + frac * (coords[i + 1][0] - coords[i][0]),
        coords[i][1] + frac * (coords[i + 1][1] - coords[i][1]),
      ]
    }
    target -= dists[i]
  }
  return coords[coords.length - 1]
}

export default function WayfinderMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const mountedRef = useRef(true)

  const { waypoints, playbackState, progress, addWaypoint, setProgress, setPlaybackState } =
    useWayfinderStore()

  // Init map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return

    const initMap = async () => {
      const maplibre = await import('maplibre-gl')

      if (!mountedRef.current || !mapContainerRef.current) return

      const map = new maplibre.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm',
            },
          ],
        },
        center: [145.42, -16.17], // Daintree Rainforest, QLD
        zoom: 11,
      })

      map.on('load', () => {
        // Route line source
        map.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
        })
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#16a34a',
            'line-width': 4,
            'line-opacity': 0.85,
          },
        })

        // Waypoint markers source
        map.addSource('waypoints', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })
        map.addLayer({
          id: 'waypoint-circles',
          type: 'circle',
          source: 'waypoints',
          paint: {
            'circle-radius': 8,
            'circle-color': '#16a34a',
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 2,
          },
        })
        map.addLayer({
          id: 'waypoint-labels',
          type: 'symbol',
          source: 'waypoints',
          layout: {
            'text-field': ['get', 'name'],
            'text-offset': [0, 1.4],
            'text-size': 12,
            'text-anchor': 'top',
          },
          paint: {
            'text-color': '#1a3a1a',
            'text-halo-color': '#fff',
            'text-halo-width': 2,
          },
        })

        // Playback marker source
        map.addSource('playhead', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [0, 0] } },
        })
        map.addLayer({
          id: 'playhead-dot',
          type: 'circle',
          source: 'playhead',
          paint: {
            'circle-radius': 10,
            'circle-color': '#dc2626',
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 3,
            'circle-opacity': 0,
          },
        })
      })

      map.on('click', (e) => {
        const { lng, lat } = e.lngLat
        addWaypoint(lng, lat)
      })

      mapRef.current = map
    }

    initMap()

    return () => {
      mountedRef.current = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update route and waypoint layers when waypoints change
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.getSource('route')) return

    const coords: [number, number][] = waypoints.map((w) => [w.lng, w.lat])

    ;(map.getSource('route') as GeoJSONSource).setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: coords },
    })

    ;(map.getSource('waypoints') as GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: waypoints.map((w) => ({
        type: 'Feature',
        properties: { name: w.name },
        geometry: { type: 'Point', coordinates: [w.lng, w.lat] },
      })),
    })

    // Hide playhead when waypoints cleared
    if (waypoints.length < 2) {
      const src = map.getSource('playhead') as GeoJSONSource | undefined
      if (src) {
        src.setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: [0, 0] },
        })
        map.setPaintProperty('playhead-dot', 'circle-opacity', 0)
      }
    }
  }, [waypoints])

  // Update playhead position when progress changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.getSource('playhead')) return

    const coords: [number, number][] = waypoints.map((w) => [w.lng, w.lat])
    if (coords.length < 2 || playbackState === 'idle') {
      map.setPaintProperty('playhead-dot', 'circle-opacity', 0)
      return
    }

    const pos = interpolateRoute(coords, progress)
    ;(map.getSource('playhead') as GeoJSONSource).setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: pos },
    })
    map.setPaintProperty('playhead-dot', 'circle-opacity', 1)
  }, [progress, playbackState, waypoints])

  // Animation loop
  const animate = useCallback(
    (timestamp: number) => {
      if (!mountedRef.current) return
      const { playbackState, progress, speed } = useWayfinderStore.getState()
      if (playbackState !== 'playing') {
        lastTimeRef.current = null
        return
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }
      const delta = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      // Full route takes 30s at speed=1
      const newProgress = Math.min(1, progress + (delta / 30) * speed)
      setProgress(newProgress)

      if (newProgress >= 1) {
        setPlaybackState('idle')
        return
      }

      animFrameRef.current = requestAnimationFrame(animate)
    },
    [setProgress, setPlaybackState]
  )

  useEffect(() => {
    if (playbackState === 'playing') {
      lastTimeRef.current = null
      animFrameRef.current = requestAnimationFrame(animate)
    } else {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
      if (playbackState !== 'paused') {
        lastTimeRef.current = null
      }
    }
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [playbackState, animate])

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
