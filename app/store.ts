'use client'
import { create } from 'zustand'

export interface Waypoint {
  id: string
  lng: number
  lat: number
  name: string
}

export type PlaybackState = 'idle' | 'playing' | 'paused'

interface WayfinderStore {
  waypoints: Waypoint[]
  playbackState: PlaybackState
  progress: number // 0–1 along full route
  speed: number // multiplier
  addWaypoint: (lng: number, lat: number) => void
  removeWaypoint: (id: string) => void
  clearWaypoints: () => void
  setPlaybackState: (state: PlaybackState) => void
  setProgress: (progress: number) => void
  setSpeed: (speed: number) => void
  resetPlayback: () => void
}

export const useWayfinderStore = create<WayfinderStore>((set) => ({
  waypoints: [],
  playbackState: 'idle',
  progress: 0,
  speed: 1,

  addWaypoint: (lng, lat) =>
    set((state) => ({
      waypoints: [
        ...state.waypoints,
        {
          id: `wp-${Date.now()}`,
          lng,
          lat,
          name: `Waypoint ${state.waypoints.length + 1}`,
        },
      ],
      playbackState: 'idle',
      progress: 0,
    })),

  removeWaypoint: (id) =>
    set((state) => ({
      waypoints: state.waypoints.filter((w) => w.id !== id),
      playbackState: 'idle',
      progress: 0,
    })),

  clearWaypoints: () =>
    set({ waypoints: [], playbackState: 'idle', progress: 0 }),

  setPlaybackState: (playbackState) => set({ playbackState }),

  setProgress: (progress) => set({ progress }),

  setSpeed: (speed) => set({ speed }),

  resetPlayback: () => set({ playbackState: 'idle', progress: 0 }),
}))
