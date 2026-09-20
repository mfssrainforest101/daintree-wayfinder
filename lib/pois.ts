export type Poi = {
  id: string
  name: string
  lng: number
  lat: number
  category: 'beach' | 'rainforest' | 'village' | 'lookout' | 'crossing'
  blurb: string
}

/**
 * Curated points of interest through the Daintree region, far north
 * Queensland — ordered loosely south-to-north along the coastal route.
 */
export const DAINTREE_POIS: Poi[] = [
  {
    id: 'mossman-gorge',
    name: 'Mossman Gorge',
    lng: 145.3339,
    lat: -16.4713,
    category: 'rainforest',
    blurb: 'Ancient lowland rainforest and clear granite swimming holes.',
  },
  {
    id: 'daintree-village',
    name: 'Daintree Village',
    lng: 145.3167,
    lat: -16.2519,
    category: 'village',
    blurb: 'River cruises and the gateway township to the north.',
  },
  {
    id: 'daintree-ferry',
    name: 'Daintree River Ferry',
    lng: 145.4114,
    lat: -16.2967,
    category: 'crossing',
    blurb: 'Cable ferry crossing into the Cape Tribulation section.',
  },
  {
    id: 'cow-bay',
    name: 'Cow Bay Beach',
    lng: 145.45,
    lat: -16.2333,
    category: 'beach',
    blurb: 'Palm-fringed sand where the rainforest meets the reef.',
  },
  {
    id: 'discovery-centre',
    name: 'Daintree Discovery Centre',
    lng: 145.42,
    lat: -16.1636,
    category: 'rainforest',
    blurb: 'Aerial walkway and canopy tower through the forest.',
  },
  {
    id: 'thornton-beach',
    name: 'Thornton Beach',
    lng: 145.4667,
    lat: -16.1667,
    category: 'beach',
    blurb: 'Long quiet beach looking out to Snapper Island.',
  },
  {
    id: 'marrdja',
    name: 'Marrdja Boardwalk',
    lng: 145.455,
    lat: -16.12,
    category: 'rainforest',
    blurb: 'Mangrove-to-rainforest boardwalk over Noah Creek.',
  },
  {
    id: 'cape-trib',
    name: 'Cape Tribulation',
    lng: 145.4643,
    lat: -16.0855,
    category: 'lookout',
    blurb: 'Where two World Heritage areas — reef and rainforest — meet.',
  },
  {
    id: 'emmagen-creek',
    name: 'Emmagen Creek',
    lng: 145.47,
    lat: -16.05,
    category: 'crossing',
    blurb: 'Freshwater creek crossing at the end of the sealed road.',
  },
]
