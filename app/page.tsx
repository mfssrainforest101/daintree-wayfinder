'use client'

import dynamic from 'next/dynamic'
import { Sidebar } from '@/components/Sidebar'

const MapView = dynamic(
  () => import('@/components/MapView').then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="map-canvas map-loading">
        <span>Loading rainforest…</span>
      </div>
    ),
  },
)

export default function Home() {
  return (
    <main className="layout">
      <Sidebar />
      <div className="map-wrap">
        <MapView />
      </div>
    </main>
  )
}
