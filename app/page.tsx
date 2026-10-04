'use client'
import dynamic from 'next/dynamic'
import Controls from './components/Controls'

const WayfinderMap = dynamic(() => import('./components/WayfinderMap'), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <div className="map-loading-inner">
        <span className="map-loading-icon">🌿</span>
        <p>Loading map…</p>
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <div className="app-layout">
      <Controls />
      <main className="map-container">
        <WayfinderMap />
      </main>
    </div>
  )
}
