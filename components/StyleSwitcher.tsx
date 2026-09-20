'use client'

import { useWaypoints, type MapStyleId } from '@/lib/store'
import { MAP_STYLES } from '@/lib/mapStyles'

const ORDER: MapStyleId[] = ['topo', 'streets', 'satellite']

export function StyleSwitcher() {
  const styleId = useWaypoints((s) => s.styleId)
  const setStyle = useWaypoints((s) => s.setStyle)

  return (
    <div className="segmented" role="radiogroup" aria-label="Map style">
      {ORDER.map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={styleId === id}
          className={styleId === id ? 'seg active' : 'seg'}
          onClick={() => setStyle(id)}
        >
          {MAP_STYLES[id].label}
        </button>
      ))}
    </div>
  )
}
