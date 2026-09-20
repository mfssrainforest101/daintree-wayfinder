import type { StyleSpecification } from 'maplibre-gl'
import type { MapStyleId } from './store'

/**
 * Key-free raster styles so the map renders in any environment without a
 * provider token. Each points at an openly available tile service.
 */
function rasterStyle(
  tiles: string[],
  attribution: string,
  background = '#0f1a14',
): StyleSpecification {
  return {
    version: 8,
    sources: {
      base: {
        type: 'raster',
        tiles,
        tileSize: 256,
        attribution,
        maxzoom: 19,
      },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': background } },
      { id: 'base', type: 'raster', source: 'base' },
    ],
  }
}

export const MAP_STYLES: Record<
  MapStyleId,
  { label: string; style: StyleSpecification }
> = {
  topo: {
    label: 'Topographic',
    style: rasterStyle(
      [
        'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
        'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
        'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
      ],
      '© OpenTopoMap (CC-BY-SA) · © OpenStreetMap contributors',
    ),
  },
  streets: {
    label: 'Streets',
    style: rasterStyle(
      [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      '© OpenStreetMap contributors',
    ),
  },
  satellite: {
    label: 'Satellite',
    style: rasterStyle(
      [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      'Imagery © Esri, Maxar, Earthstar Geographics',
    ),
  },
}

export const DAINTREE_CENTER: [number, number] = [145.42, -16.22]
export const DEFAULT_ZOOM = 9.5
