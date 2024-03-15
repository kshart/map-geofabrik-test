<template>
  <div ref="mapRef" class="map-fullpage" />
</template>

<script setup lang="ts">
import {
  Map,
  ScaleControl,
  NavigationControl,
} from 'maplibre-gl'
import type { LngLatBounds } from 'maplibre-gl'
import type { MapEntity } from '@/components/MapFullpage/MapEntity'
import 'maplibre-gl/dist/maplibre-gl.css'

const props = defineProps<{
  entities: MapEntity[]
}>()
const emit = defineEmits<{(e: 'change-polygon', polygon: [string, string][]): void}>()

const boundsToPolygon = (bounds: LngLatBounds): [string, string][] => {
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  return [
    [String(sw.lng), String(sw.lat)],
    [String(ne.lng), String(sw.lat)],
    [String(ne.lng), String(ne.lat)],
    [String(sw.lng), String(ne.lat)],
    [String(sw.lng), String(sw.lat)],
  ]
}

const loadFlats = async (map: Map) => {
  const bounds = map.getBounds()
  const dataPoints = await $fetch('/api/getThings', {
    query: {
      p: JSON.stringify(boundsToPolygon(bounds))
    }
  })
  const groups = dataPoints
  for (const things of [groups]) {
    const name = 'things'
    const color = '#047599'
    const geoJSON = {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
      },
      features: []
    }
    const source = 'group' + name
    for (const { name, geojson } of things) {
      geoJSON.features.push({
        type: 'Feature',
        properties: {
          color,
          name,
        },
        geometry: geojson
      })
    }

    map.addSource(source, {
      type: 'geojson',
      data: geoJSON,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 20,
    })
    map.addLayer({
      id: source + 'clusters',
      type: 'circle',
      source,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': color,
        'circle-radius': 10,
        'circle-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          9,
          0,
          11,
          1
        ],
      }
    })
    map.addLayer({
      id: source + '-cluster-count',
      type: 'symbol',
      source,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': [
          'case',
          ['>', ['get', 'point_count'], 9], '9+',
          ['to-string', ['get', 'point_count']]
        ],
        'text-size': 11,
      },
      paint: {
        'text-color': '#fff',
        'text-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          9,
          0,
          11,
          1
        ],
      }
    })
    map.addLayer({
      id: source + 'unclustered-point',
      type: 'circle',
      source,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': 10,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
        'circle-stroke-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          9,
          0,
          11,
          1
        ],
        'circle-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          9,
          0,
          11,
          1
        ],
      }
    })
    console.log(map.getLayersOrder())
    const withHeatmap = true
    if (withHeatmap) {
      map.addSource(source + '2', {
        type: 'geojson',
        data: geoJSON,
      })
      map.addLayer({
        id: source + 'heat',
        type: 'heatmap',
        source: source + '2',
        // maxzoom: 14,
        paint: {
          // Increase the heatmap weight based on frequency and property magnitude
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'mag'],
            0,
            0,
            3,
            1
          ],
          // Increase the heatmap color weight weight by zoom level
          // heatmap-intensity is a multiplier on top of heatmap-weight
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9,
            1,
            14,
            3
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Begin color ramp at 0-stop with a 0-transparancy color
          // to create a blur-like effect.
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(4,117,153,0)',
            0.3,
            'rgb(4,117,153,0.8)',
            1,
            'rgb(4,117,153,0.8)'
          ],
          // Adjust the heatmap radius by zoom level
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            10,
            20,
            20
          ],
          // Transition from heatmap to circle layer by zoom level
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9,
            1,
            12,
            0
          ]
        }
      })
    }
  }

  // map.on('click', 'clusters', async (e) => {
  //   const features = map.queryRenderedFeatures(e.point, {
  //     layers: ['clusters']
  //   })
  //   const clusterId = features[0].properties.cluster_id
  //   const zoom = await map.getSource('earthquakes').getClusterExpansionZoom(clusterId)
  //   map.easeTo({
  //     center: features[0].geometry.coordinates,
  //     zoom
  //   })
  // })
  // map.on('click', 'unclustered-point', (e) => {
  //   const coordinates = e.features[0].geometry.coordinates.slice()
  //   const mag = e.features[0].properties.mag
  //   let tsunami

  //   if (e.features[0].properties.tsunami === 1) {
  //     tsunami = 'yes'
  //   } else {
  //     tsunami = 'no'
  //   }

  //   // Ensure that if the map is zoomed out such that
  //   // multiple copies of the feature are visible, the
  //   // popup appears over the copy being pointed to.
  //   while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
  //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
  //   }

  //   new Popup()
  //     .setLngLat(coordinates)
  //     .setHTML(`magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`)
  //     .addTo(map)
  // })

  // map.on('mouseenter', 'clusters', () => {
  //   map.getCanvas().style.cursor = 'pointer'
  // })
  // map.on('mouseleave', 'clusters', () => {
  //   map.getCanvas().style.cursor = ''
  // })

  // map.on('mouseenter', 'unclustered-point', () => {
  //   map.getCanvas().style.cursor = 'pointer'
  // })
  // map.on('mouseleave', 'unclustered-point', () => {
  //   map.getCanvas().style.cursor = ''
  // })
}

const mapRef = ref<HTMLElement|null>(null)

const initEntitySource = (map: Map) => {
  const source = 'my-entities'
  const color = '#777'
  const geoJSON = {
    type: 'FeatureCollection',
    features: []
  } as GeoJSONFeature
  map.addSource(source, {
    type: 'geojson',
    data: geoJSON,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 20,
  })
  map.addLayer({
    id: source + 'clusters',
    type: 'circle',
    source,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': color,
      'circle-radius': 10,
    }
  })
  map.addLayer({
    id: source + '-cluster-count',
    type: 'symbol',
    source,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': [
        'case',
        ['>', ['get', 'point_count'], 9], '9+',
        ['to-string', ['get', 'point_count']]
      ],
      'text-size': 11,
    },
    paint: {
      'text-color': '#fff',
    }
  })
  map.addLayer({
    id: source + '-unclustered-point',
    type: 'circle',
    source,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': ['get', 'color'],
      'circle-radius': 10,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
    }
  })
  watch(() => props.entities, entities => {
    const geoJSON = {
      type: 'FeatureCollection',
      features: [] as any[]
    }
    for (const entity of entities) {
      geoJSON.features.push({
        type: 'Feature',
        properties: {
          color,
          name: entity.title,
        },
        geometry: entity.geometry
      })
    }
    map.getSource(source)?.setData(geoJSON)
  }, { immediate: true })
}

onMounted(() => {
  if (!mapRef.value) {
    return
  }
  const map = new Map({
    container: mapRef.value,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    /* {
      'version': 8,
      'sources': {
        'raster-tiles': {
          'type': 'raster',
          'tiles': [
            // NOTE: Layers from Stadia Maps do not require an API key for localhost development or most production
            // web deployments. See https://docs.stadiamaps.com/authentication/ for details.
            'https://tile.osm.org/{z}/{x}/{y}.png'
          ],
          'tileSize': 256
        }
      },
      'layers': [
        {
          'id': 'simple-tiles',
          'type': 'raster',
          'source': 'raster-tiles',
          'minzoom': 0,
          'maxzoom': 22
        }
      ]
    }, */
    center: [65.543743, 57.156362],
    zoom: 9,
    hash: true,
    // TerrainControl: false,
  })
  map.scrollZoom.setWheelZoomRate(1 / 100)
  const scale = new ScaleControl({
    maxWidth: 100,
    unit: 'imperial'
  })
  map.addControl(scale, 'bottom-left')
  scale.setUnit('metric')

  const nav = new NavigationControl()
  map.addControl(nav, 'top-left')

  map.on('load', () => {
    // loadFlats(map)
    initEntitySource(map)
    emit('change-polygon', boundsToPolygon(map.getBounds()))
  })
  map.on('move', () => {
    emit('change-polygon', boundsToPolygon(map.getBounds()))
  })
  // setTimeout(() => map.panTo([65.543743, 57.156362]), 1000)
  // setTimeout(() => map.panTo([65.543743, 57.256362]), 5000)
})

</script>

<style scoped>
.map-fullpage {
  width: 100vw;
  height: 100vh;
}
</style>
