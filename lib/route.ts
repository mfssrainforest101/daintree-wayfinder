// Daintree Wayfinder — corridor: Daintree River Ferry -> end of bitumen, Cape Tribulation.
// Strictly this section only. Coordinates for the end of bitumen are approximate (Beach House, ~1.5 km north of Kulki turnoff); confirm on the ground.
export interface Stop {
  id: string
  name: string
  lat: number
  lng: number
  radiusM: number
  /** Information only. Never instructs driving. No sacred sites. */
  speech: string
  /** Optional Traditional Owner recording (never synthesised). */
  toAudio?: string
}

export const STOPS: Stop[] = [
  { id: 'ferry', name: 'Daintree Ferry', lat: -16.2497, lng: 145.4008, radiusM: 500,
    speech: 'Daintree Ferry. This is the start of the Wayfinder route into the Daintree rainforest.',
    toAudio: '/audio/to-welcome.mp3' },
  { id: 'cowbay', name: 'Cow Bay', lat: -16.2206, lng: 145.4244, radiusM: 500,
    speech: 'Cow Bay. The road now runs beneath the rainforest canopy.' },
  { id: 'thornton', name: 'Thornton Beach', lat: -16.1651, lng: 145.4406, radiusM: 500,
    speech: 'Thornton Beach is nearby, with coastal lookout views.' },
  { id: 'cooper', name: 'Cooper Creek', lat: -16.1192, lng: 145.4516, radiusM: 500,
    speech: 'Cooper Creek. The bridge ahead crosses the creek.' },
  { id: 'end', name: 'End of bitumen, Cape Tribulation', lat: -16.0735, lng: 145.461, radiusM: 400,
    speech: 'This is the end of the bitumen at Cape Tribulation, and the end of the Wayfinder route.',
    toAudio: '/audio/to-farewell.mp3' },
]

export const HAZARDS = [
  { id: 'cassowary', name: 'Cassowary zone', lat: -16.213, lng: 145.431, radiusM: 800,
    speech: 'Cassowary zone. Cassowaries are known to cross the road in this area.' },
  { id: 'croc', name: 'Crocodile habitat', lat: -16.12, lng: 145.452, radiusM: 800,
    speech: 'Crocodile habitat. Crocodiles live in the waterways in this area.' },
]

// Bounding corridor with margin (deg). Outside = not on the Wayfinder route.
export const BOUNDS = { minLat: -16.28, maxLat: -16.06, minLng: 145.37, maxLng: 145.49 }

export function inBounds(lat: number, lng: number) {
  return lat >= BOUNDS.minLat && lat <= BOUNDS.maxLat && lng >= BOUNDS.minLng && lng <= BOUNDS.maxLng
}

export function distM(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371000, r = Math.PI / 180
  const dLat = (bLat - aLat) * r, dLng = (bLng - aLng) * r
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
