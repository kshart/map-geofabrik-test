<template>
  <div ref="mapRef" class="map-container" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  Map,
  ScaleControl,
  NavigationControl,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const loadFlats = async map => {
  const bounds = map.getBounds()
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  const polygon = [
    [sw.lng, sw.lat],
    [ne.lng, sw.lat],
    [ne.lng, ne.lat],
    [sw.lng, ne.lat],
    [sw.lng, sw.lat],
  ]
  const dataPoints = await $fetch('/api/getThings', {
    query: {
      p: JSON.stringify(polygon)
    }
  })
  const groups = dataPoints
  for (const things of [groups]) {
    console.log(things.length)
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

const mapRef = ref(null)
onMounted(() => {
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
    TerrainControl: false,
  })
  map.scrollZoom.setWheelZoomRate(1 / 100)
  const scale = new ScaleControl({
    maxWidth: 80,
    unit: 'imperial'
  })
  map.addControl(scale)
  scale.setUnit('metric')

  const nav = new NavigationControl()
  map.addControl(nav, 'top-left')

  map.on('load', () => {
    loadFlats(map)
  })
  setTimeout(() => map.panTo([65.543743, 57.156362]), 1000)
  setTimeout(() => map.panTo([65.543743, 57.256362]), 5000)
})
</script>

<style>
body {
  margin: 0px;
}
</style>
<style scoped>
.map-container {
  width: 100vw;
  height: 100vh;
}
</style>
