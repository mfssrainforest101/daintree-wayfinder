'use client'

import { useWaypoints } from '@/lib/store'
import { DAINTREE_POIS } from '@/lib/pois'

export function PoiList() {
  const addWaypoint = useWaypoints((s) => s.addWaypoint)

  return (
    <div className="poi-list">
      {DAINTREE_POIS.map((poi) => (
        <button
          key={poi.id}
          type="button"
          className={`poi-chip poi-${poi.category}`}
          title={poi.blurb}
          onClick={() =>
            addWaypoint({ name: poi.name, lng: poi.lng, lat: poi.lat })
          }
        >
          <span className="poi-dot" aria-hidden="true" />
          {poi.name}
        </button>
      ))}
    </div>
  )
}
