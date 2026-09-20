'use client'

import { create } from 'zustand'
import type { LngLat } from './geo'

export type Waypoint = {
  id: string
  name: string
  lng: number
  lat: number
}

export type MapStyleId = 'topo' | 'streets' | 'satellite'

let counter = 0
const nextId = () => `wp-${Date.now().toString(36)}-${(counter++).toString(36)}`

type WaypointState = {
  waypoints: Waypoint[]
  selectedId: string | null
  styleId: MapStyleId
  fitNonce: number
  addWaypoint: (input: { name?: string; lng: number; lat: number }) => void
  removeWaypoint: (id: string) => void
  renameWaypoint: (id: string, name: string) => void
  moveWaypoint: (from: number, to: number) => void
  reverse: () => void
  clear: () => void
  select: (id: string | null) => void
  setStyle: (styleId: MapStyleId) => void
  requestFit: () => void
}

export const useWaypoints = create<WaypointState>((set) => ({
  waypoints: [],
  selectedId: null,
  styleId: 'topo',
  fitNonce: 0,

  addWaypoint: ({ name, lng, lat }) =>
    set((state) => {
      const label = name?.trim() || `Waypoint ${state.waypoints.length + 1}`
      const wp: Waypoint = { id: nextId(), name: label, lng, lat }
      return { waypoints: [...state.waypoints, wp], selectedId: wp.id }
    }),

  removeWaypoint: (id) =>
    set((state) => ({
      waypoints: state.waypoints.filter((w) => w.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  renameWaypoint: (id, name) =>
    set((state) => ({
      waypoints: state.waypoints.map((w) =>
        w.id === id ? { ...w, name } : w,
      ),
    })),

  moveWaypoint: (from, to) =>
    set((state) => {
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= state.waypoints.length ||
        to >= state.waypoints.length
      ) {
        return state
      }
      const next = [...state.waypoints]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return { waypoints: next }
    }),

  reverse: () =>
    set((state) => ({ waypoints: [...state.waypoints].reverse() })),

  clear: () => set({ waypoints: [], selectedId: null }),

  select: (id) => set({ selectedId: id }),

  setStyle: (styleId) => set({ styleId }),

  requestFit: () => set((state) => ({ fitNonce: state.fitNonce + 1 })),
}))

export const toLngLat = (w: Waypoint): LngLat => ({ lng: w.lng, lat: w.lat })
