/**
 * @see https://nominatim.org/release-docs/develop/api/Search/#geojson
 */
const apiPath = 'https://nominatim.openstreetmap.org'

export type BoundingBox = [string, string, string, string]

/**
 * @see https://nominatim.org/release-docs/develop/api/Output/#jsonv2
 */
export interface SearchResultJsonV2 {
  /** Reference to the Nominatim internal database ID */
  place_id: number
  /** Reference to the OSM object */
  osm_type: string
  /** Reference to the OSM object */
  osm_id: number
  /** Latitude centroid of the object */
  lat: string
  /** Longitude centroid of the object */
  lon: string
  /** Key of the main OSM tag */
  category: string
  /** Value of the main OSM tag */
  type: string
  /** computed importance rank */
  importance: number
  /** Full comma-separated address */
  display_name: string
  /** Area of corner coordinates */
  boundingbox: BoundingBox
  place_rank: number
  addresstype: string
  name: string
  licence: string
  extratags: {
    [key: string]: string
  }
}

// accept-language browser language string content of "Accept-Language" HTTP header
export default {
  search (fts: string, viewbox?: BoundingBox): Promise<SearchResultJsonV2[]> {
    const lang = navigator.language
    const limit = 30
    const params = new URLSearchParams({
      q: fts,
      limit: String(limit),
      format: 'jsonv2',
      extratags: '1',
      'accept-language': lang,
    })
    if (viewbox) {
      params.append('viewbox', viewbox.join(','))
    }
    return fetch(`${apiPath}/search?${params.toString()}`)
      .then(responce => responce.json())
  }
}
