'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useWaypoints } from '@/lib/store'
import { MAP_STYLES, DAINTREE_CENTER, DEFAULT_ZOOM } from '@/lib/mapStyles'
import { DAINTREE_POIS } from '@/lib/pois'
import { boundsOf } from '@/lib/geo'

const ROUTE_SOURCE = 'route-src'

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const readyRef = useRef(false)
  const wpMarkers = useRef<Map<string, maplibregl.Marker>>(new Map())

  const styleId = useWaypoints((s) => s.styleId)
  const waypoints = useWaypoints((s) => s.waypoints)
  const selectedId = useWaypoints((s) => s.selectedId)
  const fitNonce = useWaypoints((s) => s.fitNonce)

  // --- Create the map once ---
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLES.topo.style,
      center: DAINTREE_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: { compact: true },
    })
    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

    map.on('load', () => {
      readyRef.current = true
      ensureRouteLayers(map)
      addPoiMarkers(map)
      syncRoute(map, useWaypoints.getState().waypoints)
    })

    // Re-add custom layers after a style switch wipes them.
    map.on('styledata', () => {
      if (!readyRef.current) return
      ensureRouteLayers(map)
      syncRoute(map, useWaypoints.getState().waypoints)
    })

    // Click empty map to drop a waypoint.
    map.on('click', (e) => {
      const target = e.originalEvent.target as HTMLElement
      if (target.closest('.wp-marker') || target.closest('.poi-marker')) return
      useWaypoints.getState().addWaypoint({
        lng: Number(e.lngLat.lng.toFixed(6)),
        lat: Number(e.lngLat.lat.toFixed(6)),
      })
    })

    map.getCanvas().style.cursor = 'crosshair'

    return () => {
      map.remove()
      mapRef.current = null
      readyRef.current = false
      wpMarkers.current.clear()
    }
  }, [])

  // --- Style switching ---
  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current) return
    map.setStyle(MAP_STYLES[styleId].style)
  }, [styleId])

  // --- Sync waypoint markers + route line ---
  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current) return

    const seen = new Set<string>()

    waypoints.forEach((wp, index) => {
      seen.add(wp.id)
      let marker = wpMarkers.current.get(wp.id)
      if (!marker) {
        const el = document.createElement('div')
        el.className = 'wp-marker'
        const num = document.createElement('span')
        num.className = 'wp-num'
        el.appendChild(num)
        el.addEventListener('click', (ev) => {
          ev.stopPropagation()
          useWaypoints.getState().select(wp.id)
        })
        marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([wp.lng, wp.lat])
          .addTo(map)
        wpMarkers.current.set(wp.id, marker)
      } else {
        marker.setLngLat([wp.lng, wp.lat])
      }
      const el = marker.getElement()
      const num = el.querySelector('.wp-num')
      if (num) num.textContent = String(index + 1)
      el.classList.toggle('is-selected', wp.id === useWaypoints.getState().selectedId)
    })

    // Remove markers for deleted waypoints.
    for (const [id, marker] of wpMarkers.current) {
      if (!seen.has(id)) {
        marker.remove()
        wpMarkers.current.delete(id)
      }
    }

    syncRoute(map, waypoints)
  }, [waypoints])

  // --- Reflect selection on markers + fly to it ---
  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current) return
    for (const [id, marker] of wpMarkers.current) {
      marker.getElement().classList.toggle('is-selected', id === selectedId)
    }
    if (selectedId) {
      const wp = waypoints.find((w) => w.id === selectedId)
      if (wp) map.flyTo({ center: [wp.lng, wp.lat], zoom: Math.max(map.getZoom(), 12), speed: 0.8 })
    }
  }, [selectedId, waypoints])

  // --- Fit the whole route into view on request ---
  useEffect(() => {
    const map = mapRef.current
    if (!map || !readyRef.current || fitNonce === 0) return
    const b = boundsOf(waypoints)
    if (!b) {
      map.flyTo({ center: DAINTREE_CENTER, zoom: DEFAULT_ZOOM })
      return
    }
    if (waypoints.length === 1) {
      map.flyTo({ center: [waypoints[0].lng, waypoints[0].lat], zoom: 12 })
      return
    }
    map.fitBounds(
      [
        [b[0], b[1]],
        [b[2], b[3]],
      ],
      { padding: { top: 80, bottom: 80, left: 80, right: 80 }, maxZoom: 14, duration: 800 },
    )
  }, [fitNonce])

  return <div ref={containerRef} className="map-canvas" aria-label="Interactive Daintree map" role="application" />
}

function ensureRouteLayers(map: maplibregl.Map) {
  if (!map.getSource(ROUTE_SOURCE)) {
    map.addSource(ROUTE_SOURCE, {
      type: 'geojson',
      data: emptyLine(),
    })
  }
  if (!map.getLayer('route-casing')) {
    map.addLayer({
      id: 'route-casing',
      type: 'line',
      source: ROUTE_SOURCE,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#0b3d2e', 'line-width': 7, 'line-opacity': 0.55 },
    })
  }
  if (!map.getLayer('route-line')) {
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: ROUTE_SOURCE,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#f2b84b', 'line-width': 3, 'line-dasharray': [2, 1.4] },
    })
  }
}

function syncRoute(map: maplibregl.Map, waypoints: { lng: number; lat: number }[]) {
  const source = map.getSource(ROUTE_SOURCE) as maplibregl.GeoJSONSource | undefined
  if (!source) return
  source.setData({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: waypoints.map((w) => [w.lng, w.lat]),
    },
  })
}

function emptyLine(): GeoJSON.Feature {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: [] },
  }
}

function addPoiMarkers(map: maplibregl.Map) {
  for (const poi of DAINTREE_POIS) {
    const el = document.createElement('button')
    el.className = `poi-marker poi-${poi.category}`
    el.type = 'button'
    el.title = `${poi.name} — add to route`
    el.setAttribute('aria-label', `Add ${poi.name} to route`)

    const popup = new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(
      `<strong>${poi.name}</strong><br/><span>${poi.blurb}</span>`,
    )

    el.addEventListener('click', (ev) => {
      ev.stopPropagation()
      useWaypoints.getState().addWaypoint({ name: poi.name, lng: poi.lng, lat: poi.lat })
    })
    el.addEventListener('mouseenter', () => popup.addTo(map))
    el.addEventListener('mouseleave', () => popup.remove())

    new maplibregl.Marker({ element: el })
      .setLngLat([poi.lng, poi.lat])
      .setPopup(popup)
      .addTo(map)
  }
}
